const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatId: String,
    senderId: String,
    text: String,
    file: { // Thêm trường file để lưu trữ thông tin file
      filename: String,
      url: String, 
      mimetype: String
    }
  },
  {
    timestamps: true,
  }
);

const messageModel = mongoose.models.Message || mongoose.model("Message", messageSchema);

module.exports = messageModel;