const Reservation = require('../models/Reservation');

exports.getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ date: 1, time: 1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createReservation = async (req, res) => {
  try {
    const { date, time, guests, customerInfo } = req.body;
    
    // Logic to check availability could be added here
    
    const newReservation = new Reservation({
      date,
      time,
      guests,
      customerInfo
    });
    
    await newReservation.save();
    res.status(201).json(newReservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(reservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
