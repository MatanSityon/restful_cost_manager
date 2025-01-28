const mongoose = require("mongoose");

/**
 * Defines the schema for user data in the MongoDB database.
 * Each user has a unique ID, name, birthdate, and marital status.
 */
const userSchema = new mongoose.Schema({
    /**
     * Unique numeric ID of the user.
     * This is used as a primary identifier.
     * @type {number}
     * @required
     * @unique
     */
    id: { type: Number, required: true, unique: true },

    /**
     * User's first name.
     * @type {string}
     * @required
     */
    first_name: { type: String, required: true },

    /**
     * User's last name.
     * @type {string}
     * @required
     */
    last_name: { type: String, required: true },

    /**
     * User's birthdate.
     * Stored as a Date object.
     * @type {Date}
     * @required
     */
    birthday: { type: Date, required: true },

    /**
     * User's marital status.
     * Expected values could be "single", "married", "divorced", etc.
     * @type {string}
     * @required
     */
    marital_status: { type: String, required: true }
});

/**
 * Exports the User model based on the schema.
 * This model interacts with the "users" collection in MongoDB.
 */
module.exports = mongoose.model("User", userSchema);
