import { Link } from 'react-router-dom'
import mingyeakImg from '../assets/mingyeak.png'
import horImg from '../assets/hor.jpeg'
import nithImg from '../assets/nith.png'
import abaImg from '../assets/aba.png'
import vattanacImg from '../assets/vattanac.png'
import wingImg from '../assets/wing.png'
import wooriImg from '../assets/woori.png'
import hangImg from '../assets/hang.png'
import chipmongImg from '../assets/chipmong.png'

const bankLogos = [
  { label: 'ABA', img: abaImg },
  { label: 'Vattanac', img: vattanacImg },
  { label: 'WingBank', img: wingImg },
  { label: 'WooriBank', img: wooriImg },
  { label: 'Hang', img: hangImg },
  { label: 'ChipMong', img: chipmongImg },
]

const values = [
  {
    icon: '🚗',
    title: 'Swift Delivery',
    desc: 'Our logistics network is optimized to ensure your groceries arrive with 2 hours of ordering.',
  },
  {
    icon: '🤝',
    title: 'Community First',
    desc: 'We partner with local farmers and artisans to support our neighborhood economy.',
  },
  {
    icon: '🌿',
    title: 'Eco-Friendly',
    desc: 'We use biodegradable packaging and optimize delivery routes to reduce our carbon footprint.',
  },
]

const team = [
  { name: 'Alex Tran', role: 'Founder & CEO', img: 'https://i.pravatar.cc/300?img=12' },
  { name: 'Mia Chen', role: 'Operations Lead', img: 'https://i.pravatar.cc/300?img=47' },
  { name: 'Daniel Cho', role: 'Customer Experience', img: 'https://i.pravatar.cc/300?img=33' },
  { name: 'Sara Kim', role: 'Logistics Manager', img: 'https://i.pravatar.cc/300?img=45' },
  { name: 'Leo Park', role: 'Product Lead', img: 'https://i.pravatar.cc/300?img=51' },
  { name: 'Nina Wu', role: 'Marketing Lead', img: 'https://i.pravatar.cc/300?img=29' },
]

const teamMembers = [
  {
    name: 'Houng Mingyeak',
    role: 'Leader',
    img: mingyeakImg,
    facebook: 'https://facebook.com/',
    telegram: 'https://t.me/',
    github: 'https://github.com/',
  },
  {
    name: 'Choeng Lyhor',
    role: 'Sub-Leader',
    img: horImg,
    facebook: 'https://facebook.com/',
    telegram: 'https://t.me/',
    github: 'https://github.com/',
  },
  {
    name: 'Khen Panit',
    role: 'Sub-Leader',
    img: nithImg,
    facebook: 'https://facebook.com/',
    telegram: 'https://t.me/',
    github: 'https://github.com/',
  },
]

export default function About() {
  return (
    <div className="bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <section className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-gray-900 dark:text-white">
              Our <span className="text-violet-500">Website</span> : Bring a lot of many
              Product and Bring have a lot of food to eat.
            </h1>
            <p className="mt-6 text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-md">
              NexaShop is a modern e-commerce platform built to make online shopping easy, secure, and enjoyable.<br />
              We offer a wide selection of products including fashion, electronics, and everyday essentials, carefully curated to meet the needs of modern customers.<br />
              Our mission is to deliver high-quality products at competitive prices while providing a smooth and reliable shopping experience.<br />
              With secure payment systems, fast delivery, and dedicated customer support, NexaShop aims to become your trusted online shopping destination.<br />
              At NexaShop, we believe that technology and innovation can simplify everyday life.<br />
              That's why we continuously improve our platform to ensure convenience, transparency, and customer satisfaction at every step.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                to="/shop"
                className="px-6 py-3 rounded-full bg-violet-500 hover:bg-violet-600 text-white font-semibold transition"
              >
                Explore our Values
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3 rounded-full border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Hero image — swap src with your own */}
          <div className="rounded-3xl overflow-hidden shadow-md">
            <img
              src="https://images.unsplash.com/photo-1601598851547-4302969d0614?w=900&q=80"
              alt="Shopping cart"
              className="w-full h-72 sm:h-80 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Payment & Contact */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Credit Card & Payment
            </h2>
            <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">10+ option</p>

            <p className="mt-6 text-xl font-semibold text-gray-900 dark:text-gray-100">
              We are stand here to make easier to you
            </p>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Please click "CONTECT ME" button<br />
              if you have problem with payment
            </p>

            <div className="mt-6 flex items-center gap-4">
              <Link
                to="/contact"
                className="px-6 py-3 rounded-full border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Contact Us
              </Link>
              <Link
                to="/checkout"
                className="px-6 py-3 rounded-full bg-violet-400 hover:bg-violet-500 text-white font-semibold flex items-center gap-2 transition"
              >
                PAY NOW <span className="text-base">💲</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-sm md:ml-auto">
            {bankLogos.map((bank) => (
              <div
                key={bank.label}
                className="rounded-2xl bg-white dark:bg-gray-900 shadow-md p-2 flex items-center justify-center aspect-square"
              >
                <img
                  src={bank.img}
                  alt={bank.label}
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team (3-card row) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
          Our Team
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="rounded-2xl bg-white dark:bg-gray-900 shadow-md p-10 flex flex-col items-center text-center"
            >
              <div className="w-44 h-44 rounded-full overflow-hidden border-4 border-violet-500">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="mt-6 text-lg font-bold text-gray-900 dark:text-gray-100">
                {member.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>

              <div className="mt-6 flex items-center gap-3">
                <a
                  href={member.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-gray-900 dark:bg-gray-700 flex items-center justify-center text-white hover:bg-violet-500 transition"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.13 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.81 8.44-4.94 8.44-9.94Z" />
                  </svg>
                </a>
                <a
                  href={member.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-gray-900 dark:bg-gray-700 flex items-center justify-center text-white hover:bg-violet-500 transition"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M21.94 4.5 18.6 19.74c-.25 1.13-.9 1.4-1.83.87l-5.06-3.73-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.16 9.39-8.49c.41-.36-.09-.56-.63-.2L6.7 12.27l-5-1.56c-1.09-.34-1.1-1.09.23-1.6L20.6 3.13c.91-.34 1.7.21 1.34 1.37Z" />
                  </svg>
                </a>
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-gray-900 dark:bg-gray-700 flex items-center justify-center text-white hover:bg-violet-500 transition"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.88-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.36 1.12 2.93.85.09-.66.34-1.12.62-1.38-2.22-.26-4.55-1.13-4.55-5.02 0-1.11.38-2.01 1-2.72-.1-.26-.44-1.3.1-2.71 0 0 .84-.27 2.75 1.04a9.32 9.32 0 0 1 5 0c1.91-1.31 2.75-1.04 2.75-1.04.54 1.41.2 2.45.1 2.71.62.71 1 1.61 1 2.72 0 3.9-2.34 4.76-4.57 5.01.36.32.67.94.67 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rooted in Quality */}
      {/* <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white">
          Rooted in Qunality
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center max-w-xl mx-auto">
          we believe that everyone deserves access to healthy food. Our values guide every delivery we mark.
        </p>

        <div className="mt-10 grid sm:grid-cols-3 gap-6">
          {values.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl bg-gray-100 dark:bg-gray-900 p-6 hover:-translate-y-1 hover:shadow-md transition"
            >
              <div className="w-10 h-10 rounded-lg bg-violet-200 dark:bg-violet-900/40 flex items-center justify-center text-lg mb-4">
                {v.icon}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">{v.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{v.desc}</p>
            </div>
          ))}
        </div>
      </section> */}

      {/* Team */}
      {/* <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">The Team Behind Shoply</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-center max-w-xl mx-auto">
          A small team working to make your shopping experience a little better, every day.
        </p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {team.map((person) => (
            <div
              key={person.name}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex items-center gap-4 hover:shadow-md transition"
            >
              <img
                src={person.img}
                alt={person.name}
                className="w-16 h-16 rounded-full object-cover shrink-0"
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{person.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{person.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section> */}
    </div>
  )
}