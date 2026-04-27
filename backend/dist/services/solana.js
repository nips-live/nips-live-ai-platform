import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { env } from '../env.js';
import { HttpError } from '../utils/http.js';
export async function verifySolPayment(signature, expectedLamports) { if (!env.solanaTreasuryWallet)
    throw new HttpError(503, 'SOLANA_TREASURY_WALLET is not configured'); const connection = new Connection(env.solanaRpcUrl, 'confirmed'); const tx = await connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0, commitment: 'confirmed' }); if (!tx)
    throw new HttpError(404, 'Solana transaction not found'); if (tx.meta?.err)
    throw new HttpError(400, 'Solana transaction failed'); const treasury = new PublicKey(env.solanaTreasuryWallet).toBase58(); let received = 0; const pre = tx.meta?.preBalances || [], post = tx.meta?.postBalances || [], keys = tx.transaction.message.accountKeys.map(k => k.pubkey.toBase58()); for (let i = 0; i < keys.length; i++)
    if (keys[i] === treasury)
        received += (post[i] || 0) - (pre[i] || 0); if (received < expectedLamports)
    throw new HttpError(400, `Insufficient SOL received. Expected ${expectedLamports}, got ${received}`); return { signature, receiver: treasury, lamports: received, sol: received / LAMPORTS_PER_SOL }; }
