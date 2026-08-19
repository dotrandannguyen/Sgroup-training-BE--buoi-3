import express from "express";
import {users} from "../data.js";

const router = express.Router();


// get all users
router.get('/users', (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Get all users successfully',
            data : users,
        })

    }
    catch(err) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null,
        })
    }
})




//get user by id
// get, by id, params,

router.get('/users/:id', (req, res) => {

    try {
        const id = parseInt(req.params.id);
        const user = users.find( u => u.id === id );
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                data: null,
            })
        }
        res.status(200).json({
            success: true,
            message: 'Get user by id successfully',
            data: user,
        })
            }
        
    catch(err){
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null,

        })
    }
})

//router tao ra 1 user
// name, email

router.post('/users', (req, res) => {
    try {
        const newUser = req.body;
        newUser.id = users.length + 1;
        users.push(newUser);
        res.status(201).json({
            success: true,
            message: 'Create user successfully',
            data: users,
        })
    }
    catch(err){
        res.status(500).json({
            success : false,
            message: 'Internal server error',
            data: null,

        })

    }
});
// chinh sua 1 phan
router.patch('/users/:id', (req,res) => {
    try {
        const id = parseInt(req.params.id);
        const user = users.find( u => u.id === id );
       if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
            data: null,
        })
       }
       if (req.body.name) {
        user.name = req.body.name;
       }
       if (req.body.email) {
        user.email = req.body.email;
       }

       res.status(200).json({
        success: true,
        message: 'Update user successfully',
        data: user,
       })
        }
            catch (err){
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    data: null,
                })
            }
        }

       
    );


    router.delete('/users/:id', (req,res) => {
    try {
        const id = parseInt(req.params.id);
        const index = users.findIndex( u => u.id === id );
        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                data: null,
            })
        }
    
        users.splice(index, 1);
        res.status(200).json({
            success: true,
            message: 'Delete user successfully',
            data: null,
        })}
            catch (err){
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    data: null,
                })
            }
        }

       
    );

export default router;
