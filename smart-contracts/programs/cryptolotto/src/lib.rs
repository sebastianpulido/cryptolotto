use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("CryptoLotto11111111111111111111111111111111");

#[program]
pub mod cryptolotto {
    use super::*;

    pub fn initialize_lottery(
        ctx: Context<InitializeLottery>,
        round: u64,
        ticket_price: u64,
        max_tickets: u64,
        end_time: i64,
    ) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        lottery.authority = ctx.accounts.authority.key();
        lottery.round = round;
        lottery.ticket_price = ticket_price;
        lottery.max_tickets = max_tickets;
        lottery.tickets_sold = 0;
        lottery.total_pool = 0;
        lottery.end_time = end_time;
        lottery.status = LotteryStatus::Active;
        lottery.winner_ticket = None;
        lottery.bump = *ctx.bumps.get("lottery").unwrap();
        
        Ok(())
    }

    pub fn buy_ticket(ctx: Context<BuyTicket>) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        
        require!(lottery.status == LotteryStatus::Active, ErrorCode::LotteryNotActive);
        require!(lottery.tickets_sold < lottery.max_tickets, ErrorCode::LotteryFull);
        
        let clock = Clock::get()?;
        require!(clock.unix_timestamp < lottery.end_time, ErrorCode::LotteryEnded);

        // Transferir USDC del comprador al pool
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.buyer_token_account.to_account_info(),
                to: ctx.accounts.lottery_pool.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, lottery.ticket_price)?;

        // Crear ticket
        let ticket = &mut ctx.accounts.ticket;
        ticket.lottery = lottery.key();
        ticket.owner = ctx.accounts.buyer.key();
        ticket.ticket_number = lottery.tickets_sold + 1;
        ticket.purchase_time = clock.unix_timestamp;
        ticket.bump = *ctx.bumps.get("ticket").unwrap();

        // Actualizar lottery
        lottery.tickets_sold += 1;
        lottery.total_pool += lottery.ticket_price;

        emit!(TicketPurchased {
            lottery: lottery.key(),
            buyer: ctx.accounts.buyer.key(),
            ticket_number: ticket.ticket_number,
            price: lottery.ticket_price,
        });

        Ok(())
    }

    pub fn draw_winner(ctx: Context<DrawWinner>) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        
        require!(lottery.status == LotteryStatus::Active, ErrorCode::LotteryNotActive);
        require!(lottery.tickets_sold > 0, ErrorCode::NoTicketsSold);
        
        let clock = Clock::get()?;
        require!(clock.unix_timestamp >= lottery.end_time, ErrorCode::LotteryNotEnded);

        // Generar número ganador usando hash del slot actual
        let recent_slothash = &ctx.accounts.slot_hashes.data.borrow()[0..8];
        let winner_number = u64::from_le_bytes(recent_slothash.try_into().unwrap()) % lottery.tickets_sold + 1;
        
        lottery.winner_ticket = Some(winner_number);
        lottery.status = LotteryStatus::Completed;

        emit!(WinnerDrawn {
            lottery: lottery.key(),
            winning_ticket: winner_number,
            prize_amount: lottery.total_pool,
        });

        Ok(())
    }

    pub fn claim_prize(ctx: Context<ClaimPrize>) -> Result<()> {
        let lottery = &ctx.accounts.lottery;
        let ticket = &ctx.accounts.ticket;
        
        require!(lottery.status == LotteryStatus::Completed, ErrorCode::LotteryNotCompleted);
        require!(ticket.lottery == lottery.key(), ErrorCode::InvalidTicket);
        require!(
            Some(ticket.ticket_number) == lottery.winner_ticket,
            ErrorCode::NotWinningTicket
        );

        // Transferir premio al ganador
        let seeds = &[
            b"lottery",
            &lottery.round.to_le_bytes(),
            &[lottery.bump],
        ];
        let signer = &[&seeds[..]];

        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.lottery_pool.to_account_info(),
                to: ctx.accounts.winner_token_account.to_account_info(),
                authority: lottery.to_account_info(),
            },
            signer,
        );
        
        // Transferir 90% al ganador, 10% queda como fee
        let prize_amount = (lottery.total_pool * 90) / 100;
        token::transfer(transfer_ctx, prize_amount)?;

        emit!(PrizeClaimed {
            lottery: lottery.key(),
            winner: ctx.accounts.winner.key(),
            amount: prize_amount,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(round: u64)]
pub struct InitializeLottery<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Lottery::INIT_SPACE,
        seeds = [b"lottery", round.to_le_bytes().as_ref()],
        bump
    )]
    pub lottery: Account<'info, Lottery>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    pub lottery: Account<'info, Lottery>,
    
    #[account(
        init,
        payer = buyer,
        space = 8 + Ticket::INIT_SPACE,
        seeds = [b"ticket", lottery.key().as_ref(), (lottery.tickets_sold + 1).to_le_bytes().as_ref()],
        bump
    )]
    pub ticket: Account<'info, Ticket>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub lottery_pool: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DrawWinner<'info> {
    #[account(mut)]
    pub lottery: Account<'info, Lottery>,
    
    pub authority: Signer<'info>,
    
    /// CHECK: SlotHashes sysvar
    #[account(address = solana_program::sysvar::slot_hashes::id())]
    pub slot_hashes: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct ClaimPrize<'info> {
    #[account(mut)]
    pub lottery: Account<'info, Lottery>,
    
    pub ticket: Account<'info, Ticket>,
    
    #[account(mut)]
    pub winner: Signer<'info>,
    
    #[account(mut)]
    pub winner_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub lottery_pool: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct Lottery {
    pub authority: Pubkey,
    pub round: u64,
    pub ticket_price: u64,
    pub max_tickets: u64,
    pub tickets_sold: u64,
    pub total_pool: u64,
    pub end_time: i64,
    pub status: LotteryStatus,
    pub winner_ticket: Option<u64>,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Ticket {
    pub lottery: Pubkey,
    pub owner: Pubkey,
    pub ticket_number: u64,
    pub purchase_time: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum LotteryStatus {
    Active,
    Completed,
}

#[event]
pub struct TicketPurchased {
    pub lottery: Pubkey,
    pub buyer: Pubkey,
    pub ticket_number: u64,
    pub price: u64,
}

#[event]
pub struct WinnerDrawn {
    pub lottery: Pubkey,
    pub winning_ticket: u64,
    pub prize_amount: u64,
}

#[event]
pub struct PrizeClaimed {
    pub lottery: Pubkey,
    pub winner: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("La lotería no está activa")]
    LotteryNotActive,
    #[msg("La lotería está llena")]
    LotteryFull,
    #[msg("La lotería ha terminado")]
    LotteryEnded,
    #[msg("No se han vendido tickets")]
    NoTicketsSold,
    #[msg("La lotería no ha terminado")]
    LotteryNotEnded,
    #[msg("La lotería no está completada")]
    LotteryNotCompleted,
    #[msg("Ticket inválido")]
    InvalidTicket,
    #[msg("No es el ticket ganador")]
    NotWinningTicket,
}