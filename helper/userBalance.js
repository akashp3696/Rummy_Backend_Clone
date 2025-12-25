const User = require("../models/userModel")
const Transaction = require("../models/transactionModel")

module.exports.updateUserBalance = async (userId, value, txn, gameType, gameId) => {
    try {
        if (!gameId) {
            return { error: "Game Id not Found." }
        }
        let amount = Number(value)
        if (isNaN(amount) || amount <= 0) {
            return { error: "Invalid amount" };
        }
        const user = await User.findById(userId)
        if (!user) {
            return { error: "User not found" };
        }

        if (txn == "debit") {
            let initialAmount = amount;
            let discountCreditUsed = 0;
            let balanceUsed = 0;
            let withdrawalableBalanceUsed = 0;
            let maxDiscountFromCredit = Math.min(user.discountCredit, amount * 0.28);
            if (maxDiscountFromCredit > 0) {
                user.discountCredit -= maxDiscountFromCredit;
                amount -= maxDiscountFromCredit;
                discountCreditUsed = maxDiscountFromCredit;
            }
            if (amount > 0) {
                if (user.balance >= amount) {
                    user.balance -= amount;
                    balanceUsed = amount;
                    amount = 0;
                } else {
                    balanceUsed = user.balance;
                    amount -= user.balance;
                    user.balance = 0;
                }
            }
            if (amount > 0) {
                if (user.withdrawalableBalance >= amount) {
                    user.withdrawalableBalance -= amount;
                    withdrawalableBalanceUsed = amount;
                    amount = 0;
                } else {
                    return { error: "Insufficient funds" };
                }
            }

            const transaction = new Transaction({
                userId,
                gameId,
                poolId: gameId,
                pointId: gameId,
                dealId: gameId,
                amount: initialAmount,
                type: txn,
                gameType: gameType,
                discountCreditUsed,
                balanceUsed,
                withdrawalableBalanceUsed,
            });
            await user.save();
            await transaction.save();
        } else if (txn == "credit") {
            const lastTransaction = await Transaction.findOne({ userId, gameId }).sort({ createdAt: -1 });

            if (!lastTransaction) {
                user.balance += amount;

                // Store the credit transaction
                const transaction = new Transaction({
                    userId,
                    gameId,
                    poolId: gameId,
                    pointId: gameId,
                    dealId: gameId,
                    amount: amount,
                    type: txn,
                    gameType: gameType,
                });
                await transaction.save();
                await user.save();

                return { success: true, user };
            }

            const {
                discountCreditUsed,
                balanceUsed,
                withdrawalableBalanceUsed
            } = lastTransaction;

            // If credited amount is more than the debited amount
            if (amount > lastTransaction.amount) {
                // Revert the full debit transaction
                user.discountCredit += discountCreditUsed;
                user.balance += balanceUsed;
                user.withdrawalableBalance += withdrawalableBalanceUsed;

                // Calculate excess amount
                let excessAmount = amount - lastTransaction.amount;
                user.withdrawalableBalance += excessAmount;  // Add excess to withdrawalable balance
                let totalWithdrawal = withdrawalableBalanceUsed + excessAmount
                const transaction = new Transaction({
                    userId,
                    gameId,
                    poolId: gameId,
                    pointId: gameId,
                    dealId: gameId,
                    amount: amount,
                    type: txn,
                    gameType: gameType,
                    discountCreditUsed: discountCreditUsed,
                    balanceUsed: balanceUsed,
                    withdrawalableBalanceUsed: totalWithdrawal,
                });
                await user.save();
                await transaction.save();
            } else {  // If credited amount is less than or equal to the debited amount
                // Reverse in the reverse order of the debit
                let remainingAmount = amount;

                // Revert from withdrawalableBalance first
                let reverseWithdrawalable = Math.min(withdrawalableBalanceUsed, remainingAmount);
                user.withdrawalableBalance += reverseWithdrawalable;
                remainingAmount -= reverseWithdrawalable;

                // Revert from balance next
                let reverseBalance = Math.min(balanceUsed, remainingAmount);
                user.balance += reverseBalance;
                remainingAmount -= reverseBalance;

                // Revert from discountCredit last
                let reverseDiscountCredit = Math.min(discountCreditUsed, remainingAmount) || 0;
                user.discountCredit += reverseDiscountCredit;
                remainingAmount -= reverseDiscountCredit;
                const transaction = new Transaction({
                    userId,
                    gameId,
                    poolId: gameId,
                    pointId: gameId,
                    dealId: gameId,
                    amount: amount,
                    type: txn,
                    gameType: gameType,
                    discountCreditUsed: reverseDiscountCredit || 0,
                    balanceUsed: reverseBalance || 0,
                    withdrawalableBalanceUsed: reverseWithdrawalable || 0,
                });
                await user.save();
                await transaction.save();
            }
        } else {
            return { error: "Invalid Txn Type" }
        }

        return { success: true, user };
    } catch (error) {
        console.error('Error updating user balance:', error);
        return { error: 'Error updating user balance' };
    }
}

module.exports.updateUserWithdramwalAmount = async (userId, value, txn, gameType) => {
    try {
        let amount = Number(value)
        if (isNaN(amount) || amount <= 0) {
            return { error: "Invalid amount" };
        }
        const user = await User.findById(userId)
        if (!user) {
            return { error: "User not found" };
        }

        if (txn == "debit") {
            if (user.withdrawalableBalance < amount) {
                return { error: "Insufficient Balance" };
            }
            user.withdrawalableBalance -= amount
            await user.save();
        } else if (txn == "credit") {
            user.withdrawalableBalance += amount
            await user.save();
        } else {
            return { error: "Invalid Txn Type" }
        }
        const transaction = new Transaction({
            userId,
            gameId: null,
            amount: amount,
            type: txn,
            gameType: gameType,
        });
        await transaction.save();
        return { success: true, user };
    } catch (error) {
        console.error('Error updating user balance:', error);
        return { error: 'Error updating user balance' };
    }
}