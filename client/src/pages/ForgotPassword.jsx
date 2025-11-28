import React, { useState } from 'react'
import { motion } from 'motion/react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { assets } from '../assets/assets'

const ForgotPassword = () => {
    const { axios, navigate } = useAppContext()
    const [email, setEmail] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { data } = await axios.post('/api/user/forgotpassword', { email })
            if (data.success) {
                toast.success(data.message)
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
                <h2 className='text-3xl font-bold mb-6 text-center'>Forgot Password</h2>
                <p className='text-gray-500 mb-6 text-center'>Enter your email address to receive a password reset link.</p>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='flex items-center gap-3 bg-white p-3 rounded-lg border border-borderColor'>
                        <img src={assets.email_icon} alt="" className='h-5 opacity-50' />
                        <input
                            onChange={e => setEmail(e.target.value)}
                            value={email}
                            type="email"
                            placeholder='Email Address'
                            className='outline-none w-full bg-transparent'
                            required
                        />
                    </div>

                    <button className='w-full bg-primary hover:bg-primary-dull text-white py-3 rounded-lg font-medium transition-all'>
                        Send Reset Link
                    </button>
                </form>

                <p className='mt-6 text-center text-gray-500'>
                    Remember your password? <span onClick={() => navigate('/login')} className='text-primary cursor-pointer hover:underline'>Login</span>
                </p>
            </motion.div>
        </div>
    )
}

export default ForgotPassword
