import { RequestHandler } from "express";
import dbConnection from "../config/dbConnection";
import fs from 'fs'


const addCart: RequestHandler = async (req, res) => {
    const { id, userId, count, title, path, price, ref, gst, weight } = req.body;

    const queryCheck = `SELECT * FROM cart WHERE id = '${id}' AND userId = '${userId}'`;
    dbConnection.query(queryCheck, (error, result) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: "Error fetching cart item",
            });
        }
        if (result.length > 0) {
            // If the item exists, update its count
            const updatedCount = result[0].count + count;
            const queryUpdate = `UPDATE cart SET count = '${updatedCount}' WHERE id = '${id}' AND userId = '${userId}'`;
            dbConnection.query(queryUpdate, (error, result) => {
                if (error) {
                    return res.status(500).json({
                        success: false,
                        message: "Error updating cart item count",
                        count: count,
                    });
                }
                return res.status(200).json({
                    success: true,
                    count: updatedCount,
                    message: "Cart item count updated successfully",
                });
            });
        } else {
            // Check if the item already exists in the cart
            const images = fs.readFileSync('src/uploads/' + path);
            // Convert image to a buffer
            const imageData = Buffer.from(images);
            // If the item does not exist, insert a new item into the cart
            const queryInsert = `INSERT INTO cart (id, userId, count, title, image, price, referralId, gst, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            dbConnection.query(queryInsert, [id, userId, count, title, imageData, price, ref, gst, weight], (error, result) => {
                if (error) {
                    return res.status(500).json({
                        success: false,
                        message: "Error adding item to cart",
                        count: count,
                        error: error
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "Item added to cart successfully",
                    count: count
                });
            });
        }
    });
}

const fetchCart: RequestHandler = async (req, res) => {
    try {
        const { uid } = req.body;
        if (!uid) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }
        const query = `SELECT * FROM cart WHERE userId = '${uid}'`
        dbConnection.query(query, (error, result) => {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: "Error fetching cart item",
                });
            }
            return res.status(200).json({
                success: true,
                data: result
            });
        });
    } catch (error) {
        console.error("Error fetching carts:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


const deleteCart: RequestHandler = async (req, res) => {
    try {
        const { uid, id } = req.body;
        if (!id) {
            return res.status(400).json({ success: false, message: "ID is required" });
        }
        const query = `DELETE FROM cart WHERE id = '${id}' AND userId = '${uid}'`
        dbConnection.query(query, (error, result) => {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: "Error deleting cart item",
                });
            }
            // Fetch updated cart data after deletion
            const updatedCartQuery = `SELECT * FROM cart WHERE userId = '${uid}'`;
            dbConnection.query(updatedCartQuery, (error, cartItems) => {
                if (error) {
                    return res.status(500).json({
                        success: false,
                        message: "Error fetching updated cart data",
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "Cart item deleted successfully",
                    cartItems: cartItems,
                });
            });
        });
    } catch (error) {
        console.error("Error deleting carts:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};



const updateCartUserId: RequestHandler = async (req, res) => {
    try {
        const { oldUid, newUid } = req.body;
        if (!oldUid || !newUid) {
            return res.status(400).json({ success: false, message: "Old UID and New UID are required" });
        }

        // Check if the old UID exists in the cart table
        const checkQuery = `SELECT * FROM cart WHERE userId = '${oldUid}'`;
        dbConnection.query(checkQuery, (error, cartItems) => {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: "Error checking old UID in cart",
                });
            }

            // If no items found with old UID, return error
            if (cartItems.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Old UID not found in cart",
                });
            }

            // Update the userId from oldUid to newUid
            const updateQuery = `UPDATE cart SET userId = '${newUid}' WHERE userId = '${oldUid}'`;
            dbConnection.query(updateQuery, (error, result) => {
                if (error) {
                    return res.status(500).json({
                        success: false,
                        message: "Error updating cart items",
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "User ID updated successfully in cart",
                });
            });
        });
    } catch (error) {
        console.error("Error updating cart user ID:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};




export { addCart, fetchCart, deleteCart, updateCartUserId };
