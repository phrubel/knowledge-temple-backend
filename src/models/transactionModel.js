const mongoose = require('mongoose');

// transaction history
const TransactionSchema = mongoose.Schema(
  {
    transactionType: {
      type: String,
      enum: ['D', 'C'], // Type of transaction
      required: true,
    },
    amount: {
      type: Number,
    },
    points: {
      type: Number,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId, // Detailed description of the transaction
      ref: 'payment',
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user', // Optional: ID of related user (e.g., the referred user)
    },
    referredTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user', // Optional: ID of related user (e.g., the referred user)
    },
    date: {
      type: Date,
      default: Date.now, // Timestamp of the transaction
    },
  },
  {
    timestamps: true,
  }
);

// Export the models
module.exports = mongoose.model('Transaction', TransactionSchema);
