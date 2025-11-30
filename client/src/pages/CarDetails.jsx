import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets, dummyCarData, cityCoordinates } from '../assets/assets'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'
import Map from '../components/Map'

const CarDetails = () => {

  const { id } = useParams()
  const { cars, axios, pickupDate, setPickupDate, returnDate, setReturnDate, user } = useAppContext()
  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const currency = import.meta.env.VITE_CURRENCY

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/reviews/${id}`);
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReviews();
    }
  }, [id]);

  const checkBookingStatus = async () => {
    try {
      if (!user) return;
      const { data } = await axios.post('/api/bookings/check-status', { carId: id });
      if (data.success && data.isBooked) {
        setOwnerDetails(data.owner);
      }
    } catch (error) {
      console.error("Failed to check booking status", error);
    }
  };

  useEffect(() => {
    if (user && id) {
      checkBookingStatus();
    }
  }, [user, id]);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/reviews/add', {
        carId: id,
        rating,
        comment
      });
      if (data.success) {
        toast.success("Review added successfully!");
        setComment("");
        setRating(5);
        fetchReviews();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add review");
    }
  };

  const initPayment = (order, booking) => {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (!razorpayKey) {
      toast.error("Razorpay Key ID is missing. Check your client .env file.");
      return;
    }

    const options = {
      key: razorpayKey,
      amount: order.amount,
      currency: order.currency,
      name: "Vishwas Wheels",
      description: `Booking for ${car.brand} ${car.model}`,
      image: assets.logo,
      order_id: order.id,
      handler: async (response) => {
        try {
          const { data } = await axios.post('/api/payment/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingId: booking._id
          });

          if (data.success) {
            toast.success("Payment Successful! Booking Confirmed.");
            setOwnerDetails(data.owner);
            setIsPaymentCompleted(true);
            // navigate('/my-bookings');
          } else {
            toast.error("Payment Verification Failed");
          }
        } catch (error) {
          console.log(error);
          toast.error("Payment Verification Failed");
        }
      },
      prefill: {
        name: "User Name",
        email: "user@example.com",
        contact: "9999999999"
      },
      theme: {
        color: "#3399cc"
      }
    };
    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Create Booking (Pending)
      const { data: bookingData } = await axios.post('/api/bookings/create', {
        car: id,
        pickupDate,
        returnDate
      })

      if (bookingData.success) {
        // 2. Create Razorpay Order
        const { data: orderData } = await axios.post('/api/payment/create-order', {
          amount: bookingData.booking.price
        });

        if (orderData.success) {
          initPayment(orderData.order, bookingData.booking);
        } else {
          toast.error("Failed to initiate payment");
        }
      } else {
        toast.error(bookingData.message)
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    setCar(cars.find(car => car._id === id))
  }, [cars, id])

  return car ? (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16'>

      <button onClick={() => navigate(-1)} className='flex items-center gap-2 mb-6 text-gray-500 cursor-pointer'>
        <img src={assets.arrow_icon} alt="" className='rotate-180 opacity-65' />
        Back to all cars
      </button>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
        {/* Left: Car Image & Details */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}

          className='lg:col-span-2'>
          <motion.img
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}

            src={car.image} alt="" className='w-full h-auto md:max-h-100 object-cover rounded-xl mb-6 shadow-md' />
          <motion.div className='space-y-6'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div>
              <h1 className='text-3xl font-bold'>{car.brand} {car.model}</h1>
              <p className='text-gray-500 text-lg'>{car.category} • {car.year}</p>
            </div>
            <hr className='border-borderColor my-6' />

            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              {[
                { icon: assets.users_icon, text: `${car.seating_capacity} Seats` },
                { icon: assets.fuel_icon, text: car.fuel_type },
                { icon: assets.car_icon, text: car.transmission },
                { icon: assets.location_icon, text: car.location },
              ].map(({ icon, text }) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}

                  key={text} className='flex flex-col items-center bg-light p-4 rounded-lg'>
                  <img src={icon} alt="" className='h-5 mb-2' />
                  {text}
                </motion.div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h1 className='text-xl font-medium mb-3'>Description</h1>
              <p className='text-gray-500'>{car.description}</p>
            </div>

            {/* Features */}
            <div>
              <h1 className='text-xl font-medium mb-3'>Features</h1>
              <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                {
                  ["360 Camera", "Bluetooth", "GPS", "Heated Seats", "Rear View Mirror"].map((item) => (
                    <li key={item} className='flex items-center text-gray-500'>
                      <img src={assets.check_icon} className='h-4 mr-2' alt="" />
                      {item}
                    </li>
                  ))
                }
              </ul>
            </div>

            {/* Map Section */}
            <div>
              <h1 className='text-xl font-medium mb-3'>Location</h1>
              <Map
                latitude={
                  (cityCoordinates[car.location] && (car.latitude === 12.9716 || !car.latitude))
                    ? cityCoordinates[car.location].lat
                    : (car.latitude || 12.9716)
                }
                longitude={
                  (cityCoordinates[car.location] && (car.longitude === 77.5946 || !car.longitude))
                    ? cityCoordinates[car.location].lng
                    : (car.longitude || 77.5946)
                }
                locationName={car.location}
              />
            </div>

            {/* Owner Details Section */}
            <div className='mt-8'>
              <h1 className='text-xl font-medium mb-3'>Owner Details</h1>
              {!ownerDetails ? (
                <div className='flex items-center gap-4 bg-gray-100 p-6 rounded-xl border border-gray-200 opacity-80'>
                  <div className='bg-gray-300 p-3 rounded-full'>
                    <span className='text-2xl'>🔒</span>
                  </div>
                  <div>
                    <p className='text-lg font-semibold text-gray-700'>Contact Hidden</p>
                    <p className='text-sm text-gray-500'>Book this car to reveal owner details.</p>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className='bg-blue-50 border border-blue-200 p-6 rounded-xl'
                >
                  <div className='flex items-center gap-4 mb-4'>
                    <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl'>
                      {ownerDetails?.name?.[0] || 'O'}
                    </div>
                    <div>
                      <h3 className='text-lg font-bold text-gray-800'>{ownerDetails?.name}</h3>
                      <p className='text-gray-600'>{ownerDetails?.email}</p>
                    </div>
                  </div>
                  <button className='w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors'>
                    Call Now
                  </button>
                </motion.div>
              )}
            </div>

            {/* Reviews Section */}
            <div className='mt-12'>
              <h1 className='text-2xl font-bold mb-6'>Reviews & Ratings</h1>

              {/* Average Rating */}
              <div className='flex items-center gap-4 mb-8'>
                <div className='text-4xl font-bold text-gray-800'>{averageRating}</div>
                <div>
                  <div className='flex text-yellow-500 text-lg'>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.round(averageRating) ? "text-yellow-500" : "text-gray-300"}>★</span>
                    ))}
                  </div>
                  <p className='text-gray-500'>{reviews.length} Reviews</p>
                </div>
              </div>

              {/* Review Form */}
              <form onSubmit={handleReviewSubmit} className='bg-light p-6 rounded-xl mb-8'>
                <h3 className='text-lg font-semibold mb-4'>Leave a Review</h3>
                <div className='mb-4'>
                  <label className='block text-gray-600 mb-2'>Rating</label>
                  <div className='flex gap-2'>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-2xl ${rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className='mb-4'>
                  <label className='block text-gray-600 mb-2'>Comment</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className='w-full border border-borderColor rounded-lg p-3'
                    rows="3"
                    placeholder="Share your experience..."
                    required
                  ></textarea>
                </div>
                <button type="submit" className='bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dull transition-colors'>
                  Submit Review
                </button>
              </form>

              {/* Reviews List */}
              <div className='space-y-6'>
                {reviews.map((review) => (
                  <div key={review._id} className='border-b border-borderColor pb-6'>
                    <div className='flex items-center gap-3 mb-3'>
                      <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden'>
                        {review.user?.image ? <img src={review.user.image} alt={review.user.name} className='w-full h-full object-cover' /> : <span className='text-gray-500 font-bold'>{review.user?.name?.[0]}</span>}
                      </div>
                      <div>
                        <p className='font-semibold'>{review.user?.name || 'Anonymous'}</p>
                        <div className='flex text-yellow-500 text-sm'>
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? "text-yellow-500" : "text-gray-300"}>★</span>
                          ))}
                        </div>
                      </div>
                      <span className='ml-auto text-sm text-gray-400'>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className='text-gray-600'>{review.comment}</p>
                  </div>
                ))}
                {reviews.length === 0 && <p className='text-gray-500'>No reviews yet.</p>}
              </div>
            </div>

          </motion.div>
        </motion.div>

        {/* Right: Booking Form */}
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}

          onSubmit={handleSubmit} className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500'>

          <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>{currency}{car.pricePerDay}<span className='text-base text-gray-400 font-normal'>per day</span></p>

          <hr className='border-borderColor my-6' />

          <div className='flex flex-col gap-2'>
            <label htmlFor="pickup-date">Pickup Date</label>
            <input value={pickupDate} onChange={(e) => setPickupDate(e.target.value)}
              type="date" className='border border-borderColor px-3 py-2 rounded-lg' required id='pickup-date' min={new Date().toISOString().split('T')[0]} />
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor="return-date">Return Date</label>
            <input value={returnDate} onChange={(e) => setReturnDate(e.target.value)}
              type="date" className='border border-borderColor px-3 py-2 rounded-lg' required id='return-date' min={pickupDate} />
          </div>

          <button disabled={isPaymentCompleted} className={`w-full bg-primary hover:bg-primary-dull transition-all py-3 font-medium text-white rounded-xl cursor-pointer ${isPaymentCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isPaymentCompleted ? 'Booking Confirmed' : 'Book Now'}
          </button>

          {/* <p className='text-center text-sm'>No credit card required to reserve</p> */}

        </motion.form>
      </div>

    </div >
  ) : <Loader />
}

export default CarDetails
