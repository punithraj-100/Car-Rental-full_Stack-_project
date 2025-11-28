import React, { useState } from 'react'
import { motion } from 'motion/react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { assets } from '../assets/assets'
import { useParams } from 'react-router-dom'

const ResetPassword = () => {
    const { axios, navigate } = useAppContext()
    const { resetToken } = useParams()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match")
        }
        if (password.length < 8) {
            return toast.error("Password must be at least 8 characters")
        }

        try {
            const { data } = await axios.put(`/api/user/resetpassword/${resetToken}`, { password })
            if (data.success) {
                toast.success(data.message)
                navigate('/login')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong")
        }
    }

    return (
        <div className='flex items-center justify-center min-h-[70vh] px-6 sm:px-0'>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className='bg-light p-10 rounded-xl shadow-lg w-full sm:w-96 border border-borderColor'
            >
                <h2 className='text-3xl font-bold mb-6 text-center'>Reset Password</h2>
                <p className='text-gray-500 mb-6 text-center'>Enter your new password below.</p>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='flex items-center gap-3 bg-white p-3 rounded-lg border border-borderColor'>
                        <img src={assets.lock_icon} alt="" className='h-5 opacity-50' />
                        <input
                            onChange={e => setPassword(e.target.value)}
                            value={password}
                            type="password"
                            placeholder='New Password'
                            className='outline-none w-full bg-transparent'
                            required
                        />
                    </div>
                    <div className='flex items-center gap-3 bg-white p-3 rounded-lg border border-borderColor'>
                        <img src={assets.lock_icon} alt="" className='h-5 opacity-50' />
                        <input
                            onChange={e => setConfirmPassword(e.target.value)}
                            value={confirmPassword}
                            type="password"
                            placeholder='Confirm New Password'
                            className='outline-none w-full bg-transparent'
                            required
                        />
                    </div>

                    <button className='w-full bg-primary hover:bg-primary-dull text-white py-3 rounded-lg font-medium transition-all'>
                        Reset Password
                    </button>
                </form>
            </motion.div>
        </div>
    )
}

export default ResetPassword
