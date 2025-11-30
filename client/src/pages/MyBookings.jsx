import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'

const MyBookings = () => {

  const { axios, user, currency, navigate } = useAppContext()

  const [bookings, setBookings] = useState([])

  const fetchMyBookings = async () => {
    try {
      const { data } = await axios.get('/api/bookings/user')
      if (data.success) {
        setBookings(data.bookings)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    user && fetchMyBookings()
  }, [user])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}

      className='px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl'>

      <Title title='My Bookings'
        subTitle='View and manage your all car bookings'
        align="left" />

      <div>
        {bookings.map((booking, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}

            key={booking._id}
            onClick={() => {
              if (booking.car && booking.car._id) {
                navigate(`/car-details/${booking.car._id}`)
                window.scrollTo(0, 0)
              }
            }}
            className='grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor rounded-lg mt-5 first:mt-12 cursor-pointer hover:bg-gray-50 transition-colors'>

            {/* --- Car Image + Info (FIXED FOR DELETED CARS) --- */}
            <div className='md:col-span-1'>
              <div className='rounded-md overflow-hidden mb-3'>
                {/* Safe access to image with ?. */}
                <img
                  src={booking.car?.image}
                  alt={booking.car?.name || 'Car Unavailable'}
                  className='w-full h-auto aspect-video object-cover'
                />
              </div>

              {/* Fallback text if car is deleted */}
              <p className='text-lg font-medium mt-2'>
                {booking.car ? `${booking.car.brand} ${booking.car.model}` : "Car No Longer Available"}
              </p>

              <p className='text-gray-500'>
                {booking.car?.year} • {booking.car?.category} • {booking.car?.location || 'N/A'}
              </p>
            </div>

            {/* --- Booking Info (FIXED WITH TIMEOUT STATUS) --- */}
            <div className='md:col-span-2'>
              <div className='flex items-center gap-2'>
                <p className='px-3 py-1.5 bg-light rounded'>Booking #{index + 1}</p>

                {/* Specific Status Styling */}
                {booking.status === 'confirmed' && (
                  <p className="px-3 py-1 text-xs rounded-full bg-green-400/15 text-green-600">Confirmed</p>
                )}

                {booking.status === 'cancelled' && (
                  <p className="px-3 py-1 text-xs rounded-full bg-red-400/15 text-red-600">Cancelled</p>
                )}

                {booking.status === 'pending' && (
                  <p className="px-3 py-1 text-xs rounded-full bg-yellow-400/15 text-yellow-600">Pending</p>
                )}

                {booking.status === 'timeout' && (
                  <p className="px-3 py-1 text-xs rounded-full bg-orange-400/15 text-orange-600 font-medium">
                    Owner Not Responded
                  </p>
                )}
              </div>

              <div className='flex items-start gap-2 mt-3'>
                <img src={assets.calendar_icon_colored} alt="" className='w-4 h-4 mt-1' />
                <div>
                  <p className='text-gray-500'>Rental Period</p>
                  <p>{booking.pickupDate.split('T')[0]} To {booking.returnDate.split('T')[0]}</p>
                </div>
              </div>

              <div className='flex items-start gap-2 mt-3'>
                <img src={assets.location_icon_colored} alt="" className='w-4 h-4 mt-1' />
                <div>
                  <p className='text-gray-500'>Pick-up Location</p>
                  {/* Safe access to location */}
                  <p>{booking.car?.location || "Location Unavailable"}</p>
                </div>
              </div>
            </div>

            {/* --- Price --- */}
            <div className='md:col-span-1 flex flex-col justify-between gap-6'>
              <div className='text-sm text-gray-500 text-right'>
                <p>Total Price</p>
                <h1 className='text-2xl font-semibold text-primary'>{currency}{booking.price}</h1>
                <p>Booked on {booking.createdAt.split('T')[0]}</p>
              </div>
            </div>

          </motion.div>
        ))}
      </div>

    </motion.div>
  )
}

export default MyBookings