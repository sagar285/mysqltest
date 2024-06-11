import { Router } from 'express'
import { addCart, deleteCart, fetchCart, updateCartUserId } from '../controller/cart.controller'

const route = Router()

route.post("/add", addCart)
route.post("/fetch", fetchCart)
route.post("/delete", deleteCart)
route.post("/update", updateCartUserId)

export default route