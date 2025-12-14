import React from "react"

export default function App() {
  return (
    <div className="min-h-screen bg-blue-500 text-white p-4">
  <nav className="flex justify-between">
    <a href="#" className="text-lg font-bold">Blue World</a>
    <ul className="flex space-x-4">
      <li><a href="#" className="text-lg hover:text-blue-700">Home</a></li>
      <li><a href="#" className="text-lg hover:text-blue-700">About</a></li>
      <li><a href="#" className="text-lg hover:text-blue-700">Services</a></li>
      <li><a href="#" className="text-lg hover:text-blue-700">Contact</a></li>
    </ul>
  </nav>
  <main className="container mx-auto p-4 mt-12">
    <h1 className="text-4xl">Welcome to Blue World</h1>
    <p className="text-lg">This is a modern blue hello world website.</p>
  </main>
</div>
  )
}