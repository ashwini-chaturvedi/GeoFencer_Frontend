import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
export default function Home() {
    const navigate = useNavigate()//React Router method to route to another pag
    return (
        <>
            <section className="flex flex-col items-center justify-center text-center p-10 min-h-[60vh] mt-40">
                <motion.h1
                    className="text-4xl md:text-6xl font-bold mb-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Real-Time Geo Tracking &
                    <br />
                    Geo Fencing
                </motion.h1>

                <motion.p
                    className="text-lg text-gray-600 max-w-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    Track and monitor devices in real-time with precision and ease. Get live updates, shortest routes, and
                    <span className="m-2 font-bold">
                        Geofencing
                    </span>
                    alerts.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    whileHover={{scale:1.15}}
                >
                    <button className="mt-6 px-6 py-3 text-lg bg-blue-600 font-bold text-black rounded-xl hover:bg-blue-700 transition-all bg-gradient-to-r from-blue-400 to-yellow-200 hover:from-yellow-200 hover:to-blue-400 " onClick={() => navigate('/login')}>
                        Start Tracking
                    </button>
                </motion.div>
            </section>

        </>
    )
}