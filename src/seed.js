require('dotenv').config();
const prisma = require('./prisma');

async function main() {
  const count = await prisma.trip.count();
  if (count > 0) return;
  const trips = [
    {
      title: 'Goa Beach Escape',
      description: 'Sun, sand, and seafood. A relaxing 3-night escape on the shores of Goa with curated beach activities.',
      location: 'Goa, India',
      price: 14999,
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 17),
      seatsAvailable: 20,
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600'
    },
    {
      title: 'Manali Adventure Trails',
      description: 'Trek the Himalayas, camp under the stars, and explore breathtaking valleys on a 5-day adventure.',
      location: 'Manali, India',
      price: 19999,
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 35),
      seatsAvailable: 15,
      imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600'
    },
    {
      title: 'Kerala Backwaters Retreat',
      description: 'Houseboat cruise, serene canals, and authentic cuisine in a 4-day tranquil retreat.',
      location: 'Alleppey, Kerala',
      price: 17999,
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25),
      seatsAvailable: 12,
      imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1600'
    },
    {
      title: 'Jaipur Royal Heritage',
      description: 'Explore palaces, forts, and vibrant bazaars with curated tours and cultural evenings.',
      location: 'Jaipur, Rajasthan',
      price: 12999,
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 13),
      seatsAvailable: 25,
      imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1600'
    }
  ];
  await prisma.trip.createMany({ data: trips });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    await prisma.$disconnect();
    process.exit(1);
  });
