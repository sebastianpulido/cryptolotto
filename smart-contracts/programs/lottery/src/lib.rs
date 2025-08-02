use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("11111111111111111111111111111111");

#[program]
pub mod lottery {
    use super::*;

    pub fn initialize_lottery(
        ctx: Context<InitializeLottery>,
        ticket_price: u64,
        max_tickets: u32,
        draw_timestamp: i64,
    ) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        lottery.authority = ctx.accounts.authority.key();
        lottery.ticket_price = ticket_price;
        lottery.max_tickets = max_tickets;
        lottery.current_tickets = 0;
        lottery.draw_timestamp = draw_timestamp;
        lottery.status = LotteryStatus::Active;
        lottery.prize_pool = 0;
        lottery.winner = None;
        lottery.bump = *ctx.bumps.get("lottery").unwrap();
        
        Ok(())
    }

    pub fn buy_ticket(ctx: Context<BuyTicket>) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        
        require!(lottery.status == LotteryStatus::Active, ErrorCode::LotteryNotActive);
        require!(lottery.current_tickets < lottery.max_tickets, ErrorCode::LotteryFull);
        
        // Transfer payment from user to lottery vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.lottery_vault.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, lottery.ticket_price)?;

        // Create ticket
        let ticket = &mut ctx.accounts.ticket;
        ticket.lottery = lottery.key();
        ticket.owner = ctx.accounts.user.key();
        ticket.ticket_number = lottery.current_tickets + 1;
        ticket.purchase_timestamp = Clock::get()?.unix_timestamp;
        ticket.bump = *ctx.bumps.get("ticket").unwrap();

        // Update lottery state
        lottery.current_tickets += 1;
        lottery.prize_pool += lottery.ticket_price;

        emit!(TicketPurchased {
            lottery: lottery.key(),
            buyer: ctx.accounts.user.key(),
            ticket_number: ticket.ticket_number,
            timestamp: ticket.purchase_timestamp,
        });

        Ok(())
    }

    pub fn draw_winner(ctx: Context<DrawWinner>) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        
        require!(lottery.status == LotteryStatus::Active, ErrorCode::LotteryNotActive);
        require!(Clock::get()?.unix_timestamp >= lottery.draw_timestamp, ErrorCode::DrawNotReady);
        require!(lottery.current_tickets > 0, ErrorCode::NoTicketsSold);

        // Generate pseudo-random number using recent blockhash
        let recent_blockhash = ctx.accounts.recent_blockhashes.data.borrow();
        let hash_bytes = &recent_blockhash[0..32];
        let mut hash_sum: u64 = 0;
        for byte in hash_bytes {
            hash_sum = hash_sum.wrapping_add(*byte as u64);
        }
        
        let winning_number = (hash_sum % lottery.current_tickets as u64) + 1;
        
        lottery.winner = Some(winning_number as u32);
        lottery.status = LotteryStatus::Completed;

        emit!(WinnerDrawn {
            lottery: lottery.key(),
            winning_number: winning_number as u32,
            prize_pool: lottery.prize_pool,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn claim_prize(ctx: Context<ClaimPrize>) -> Result<()> {
        let lottery = &ctx.accounts.lottery;
        let ticket = &ctx.accounts.ticket;
        
        require!(lottery.status == LotteryStatus::Completed, ErrorCode::LotteryNotCompleted);
        require!(ticket.lottery == lottery.key(), ErrorCode::InvalidTicket);
        require!(Some(ticket.ticket_number) == lottery.winner, ErrorCode::NotWinningTicket);

        // Calculate platform fee (10%)
        let platform_fee = lottery.prize_pool / 10;
        let winner_prize = lottery.prize_pool - platform_fee;

        // Transfer prize to winner
        let seeds = &[
            b"lottery",
            lottery.authority.as_ref(),
            &lottery.draw_timestamp.to_le_bytes(),
            &[lottery.bump],
        ];
        let signer = &[&seeds[..]];

        let transfer_to_winner_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.lottery_vault.to_account_info(),
                to: ctx.accounts.winner_token_account.to_account_info(),
                authority: ctx.accounts.lottery.to_account_info(),
            },
            signer,
        );
        token::transfer(transfer_to_winner_ctx, winner_prize)?;

        // Transfer platform fee
        let transfer_fee_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.lottery_vault.to_account_info(),
                to: ctx.accounts.platform_vault.to_account_info(),
                authority: ctx.accounts.lottery.to_account_info(),
            },
            signer,
        );
        token::transfer(transfer_fee_ctx, platform_fee)?;

        emit!(PrizeClaimed {
            lottery: lottery.key(),
            winner: ctx.accounts.winner.key(),
            amount: winner_prize,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(ticket_price: u64, max_tickets: u32, draw_timestamp: i64)]
pub struct InitializeLottery<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Lottery::INIT_SPACE,
        seeds = [b"lottery", authority.key().as_ref(), &draw_timestamp.to_le_bytes()],
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
        payer = user,
        space = 8 + Ticket::INIT_SPACE,
        seeds = [b"ticket", lottery.key().as_ref(), &(lottery.current_tickets + 1).to_le_bytes()],
        bump
    )]
    pub ticket: Account<'info, Ticket>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub lottery_vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DrawWinner<'info> {
    #[account(mut, has_one = authority)]
    pub lottery: Account<'info, Lottery>,
    
    pub authority: Signer<'info>,
    
    /// CHECK: This account is used to access recent blockhashes for randomness
    #[account(address = solana_program::sysvar::recent_blockhashes::ID)]
    pub recent_blockhashes: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct ClaimPrize<'info> {
    #[account(mut)]
    pub lottery: Account<'info, Lottery>,
    
    #[account(has_one = lottery, has_one = owner)]
    pub ticket: Account<'info, Ticket>,
    
    #[account(mut)]
    pub winner: Signer<'info>,
    
    #[account(mut)]
    pub winner_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub lottery_vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub platform_vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    
    /// CHECK: This is the owner field in the ticket account
    pub owner: AccountInfo<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Lottery {
    pub authority: Pubkey,
    pub ticket_price: u64,
    pub max_tickets: u32,
    pub current_tickets: u32,
    pub draw_timestamp: i64,
    pub status: LotteryStatus,
    pub prize_pool: u64,
    pub winner: Option<u32>,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Ticket {
    pub lottery: Pubkey,
    pub owner: Pubkey,
    pub ticket_number: u32,
    pub purchase_timestamp: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum LotteryStatus {
    Active,
    Drawing,
    Completed,
}

#[event]
pub struct TicketPurchased {
    pub lottery: Pubkey,
    pub buyer: Pubkey,
    pub ticket_number: u32,
    pub timestamp: i64,
}

#[event]
pub struct WinnerDrawn {
    pub lottery: Pubkey,
    pub winning_number: u32,
    pub prize_pool: u64,
    pub timestamp: i64,
}

#[event]
pub struct PrizeClaimed {
    pub lottery: Pubkey,
    pub winner: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Lottery is not active")]
    LotteryNotActive,
    #[msg("Lottery is full")]
    LotteryFull,
    #[msg("Draw is not ready yet")]
    DrawNotReady,
    #[msg("No tickets sold")]
    NoTicketsSold,
    #[msg("Lottery is not completed")]
    LotteryNotCompleted,
    #[msg("Invalid ticket")]
    InvalidTicket,
    #[msg("Not a winning ticket")]
    NotWinningTicket,
}