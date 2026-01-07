import React, { useContext, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { getTotalCartAmount, placeOrder } = useContext(StoreContext)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [stateField, setStateField] = useState('')
  const [zip, setZip] = useState('')
  const [country, setCountry] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const deliveryAddress = `${firstName} ${lastName}, ${street}, ${city}, ${stateField}, ${zip}, ${country}, phone:${phone}, email:${email}`
    setLoading(true)
    try {
      const res = await placeOrder(deliveryAddress)
      setLoading(false)
      if (res.ok) {
        const id = res.data && res.data.orderId;
        navigate(`/order-success?orderId=${id}`)
      } else {
        setError(res.error || (res.data && res.data.error) || 'Order failed')
      }
    } catch (err) {
      setLoading(false)
      setError('Network error')
    }
  }

  return (
    <form className='place-order' onSubmit={handleSubmit}>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input required value={firstName} onChange={e=>setFirstName(e.target.value)} type="text" placeholder='First Name' />
          <input required value={lastName} onChange={e=>setLastName(e.target.value)} type="text" placeholder='Last Name' />
        </div>
        <input className='emaill' required value={email} onChange={e=>setEmail(e.target.value)} placeholder='Email address' />
        <input className='streett' required value={street} onChange={e=>setStreet(e.target.value)} type="text" placeholder='Street' />
        <div className="multi-fields">
          <input required value={city} onChange={e=>setCity(e.target.value)} type="text" placeholder='City' />
          <input required value={stateField} onChange={e=>setStateField(e.target.value)} type="text" placeholder='State' />
        </div>
        <div className="multi-fields">
          <input required value={zip} onChange={e=>setZip(e.target.value)} type="text" placeholder='Zip code' />
          <input required value={country} onChange={e=>setCountry(e.target.value)} type="text" placeholder='Country' />
        </div>
        <input className='phonee' required value={phone} onChange={e=>setPhone(e.target.value)} type="text" placeholder='Phone' />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
            </div>
          </div>
          <button type='submit' disabled={loading}>{loading ? 'Placing...' : 'PROCEED TO PAYMENT'}</button>
          {error && <div style={{color:'red', marginTop:8}}>{error}</div>}
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder
