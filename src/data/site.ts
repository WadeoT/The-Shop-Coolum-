export const business = {
  name: 'The Shop @ Coolum',
  phone: '0400 301 078',
  telephone: '+61400301078',
  street: 'Shop 5, 1776/1784 David Low Way',
  locality: 'Coolum Beach QLD 4573',
  location: 'Opposite Coolum Surf Club',
  directions: 'https://www.google.com/maps/dir/?api=1&destination=The+Shop+Coolum+Shop+5+1776+1784+David+Low+Way+Coolum+Beach+QLD+4573',
  // Supplied by the commissioning brief. Confirm with the owner before launch.
  contactVerified: false,
  hours: null as null | { day: string; hours: string }[],
  socials: [] as { label: string; url: string }[],
  // Add the approved, locally hosted Higgsfield film here. Never autoplay it.
  film: { src: '', poster: '/images/coffee-1280.webp' },
};

export const navigation = [
  { label: 'Home', href: '/' },
  { label: 'Coffee + Food', href: '/coffee-food/' },
  { label: 'Groceries', href: '/groceries/' },
  { label: 'Local', href: '/local/' },
  { label: 'Our Story', href: '/our-story/' },
  { label: 'Visit', href: '/visit/' },
];

export const categories = [
  { number: '01', title: 'Coffee', text: 'Start the day here.', href: '/coffee-food/#coffee' },
  { number: '02', title: 'Fresh food', text: 'Something good for the road.', href: '/coffee-food/#fresh-food' },
  { number: '03', title: 'Groceries', text: 'The everyday, a little better.', href: '/groceries/' },
  { number: '04', title: 'Local finds', text: 'Independent spirit. Thoughtful finds.', href: '/local/' },
  { number: '05', title: 'Little extras', text: 'A small, unexpected delight.', href: '/groceries/#little-extras' },
];
