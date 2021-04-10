const {Schema, model} = require('mongoose');

const UserModelSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const User = model("user", UserModelSchema);

module.exports = User;