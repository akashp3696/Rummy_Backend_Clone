const User = require("../models/userModel")
const Transaction = require("../models/transactionchipModel")

module.exports.updateUserBalanceChip = async (userId, value, txn, gameType)=>{
    try {
        let amount = Number(value)
        if (isNaN(amount) || amount <= 0) {
            return { error: "Invalid amount" };
        }
        const user = await User.findById(userId)
        if (!user) {
            return { error: "User not found" };
        }
        
        if(txn=="debit"){
            if (user.gamechip < amount) {
                return { error: "Insufficient gamechip" };
            }
            user.gamechip -= amount 
            await user.save();
        }else if(txn=="credit"){
            user.gamechip += amount
            await user.save();
        }else{
            return {error:"Invalid Txn Type"}
        }
        const transaction = new Transaction({
            userId,
            gameId: null,
            amount: amount,
            type: txn,
            gameType:gameType,
        });
        await transaction.save();
        return { success: true, user };
    } catch (error) {
        console.error('Error updating user gamechip:', error);
        return { error: 'Error updating user gamechip' };
    }
}

module.exports.updateUserWithdramwalAmountChip = async (userId, value, txn, gameType)=>{
    try {
        let amount = Number(value)
        if (isNaN(amount) || amount <= 0) {
            return { error: "Invalid amount" };
        }
        const user = await User.findById(userId)
        if (!user) {
            return { error: "User not found" };
        }
        
        if(txn=="debit"){
            if (user.gamechip < amount) {
                return { error: "Insufficient gamechip" };
            }
            user.gamechip -= amount 
            await user.save();
        }else if(txn=="credit"){
            user.gamechip += amount
            await user.save();
        }else{
            return {error:"Invalid Txn Type"}
        }
        const transaction = new Transaction({
            userId,
            gameId: null,
            amount: amount,
            type: txn,
            gameType:gameType,
        });
        await transaction.save();
        return { success: true, user };
    } catch (error) {
        console.error('Error updating user gamechip:', error);
        return { error: 'Error updating user gamechip' };
    }
}