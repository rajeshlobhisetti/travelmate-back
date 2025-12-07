const prisma = require('../prisma');
const Joi = require('joi');

const tripSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().min(10).required(),
  location: Joi.string().required(),
  price: Joi.number().min(0).required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  seatsAvailable: Joi.number().integer().min(0).required(),
  imageUrl: Joi.string().uri().optional().allow(''),
  noOfDays: Joi.number().integer().min(1).optional()
});

async function listTrips(req, res) {
  const { start, end } = req.query || {};
  const where = {};
  if (start || end) {
    where.AND = [];
    if (start) where.AND.push({ startDate: { gte: new Date(start) } });
    if (end) where.AND.push({ endDate: { lte: new Date(end) } });
  }
  const trips = await prisma.trip.findMany({ where, orderBy: { startDate: 'asc' } });
  res.json({ trips });
}

async function getTrip(req, res) {
  const { id } = req.params;
  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip) return res.status(404).json({ message: 'Trip not found' });
  res.json({ trip });
}

async function createTrip(req, res) {
  const { value, error } = tripSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  if (new Date(value.endDate) < new Date(value.startDate)) {
    return res.status(400).json({ message: 'endDate must be after startDate' });
  }
  if (!value.noOfDays && value.startDate && value.endDate) {
    const ms = new Date(value.endDate) - new Date(value.startDate);
    value.noOfDays = Math.max(1, Math.round(ms / (1000*60*60*24)));
  }
  const trip = await prisma.trip.create({ data: value });
  res.status(201).json({ trip });
}

async function updateTrip(req, res) {
  const { id } = req.params;
  const { value, error } = tripSchema.partial().validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  if (!value.noOfDays && value.startDate && value.endDate) {
    const ms = new Date(value.endDate) - new Date(value.startDate);
    value.noOfDays = Math.max(1, Math.round(ms / (1000*60*60*24)));
  }
  try {
    const trip = await prisma.trip.update({ where: { id }, data: value });
    res.json({ trip });
  } catch (e) {
    res.status(404).json({ message: 'Trip not found' });
  }
}

async function deleteTrip(req, res) {
  const { id } = req.params;
  try {
    await prisma.trip.delete({ where: { id } });
    res.json({ message: 'Trip deleted' });
  } catch (e) {
    res.status(404).json({ message: 'Trip not found' });
  }
}

module.exports = { listTrips, getTrip, createTrip, updateTrip, deleteTrip };

