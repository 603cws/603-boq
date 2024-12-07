'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function Cart({ open, setOpen, cartItems }) {

  const grandTotal = cartItems.reduce(
    (total, item) => total + item.price + (item.addOnsCost || 0),
    0
  );

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <DialogPanel
              transition
              className="pointer-events-auto relative w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
            >
              <TransitionChild>
                <div className="absolute right-5 top-2 -ml-8 flex pr-2 pt-4 duration-500 ease-in-out data-[closed]:opacity-0 sm:-ml-10 sm:pr-4">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="relative rounded-md text-black-300 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <span className="absolute -inset-2.5" />
                    <span className="sr-only">Close panel</span>
                    <XMarkIcon aria-hidden="true" className="size-6" />
                  </button>
                </div>
              </TransitionChild>
              <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                <div className="px-4 sm:px-6">
                  <DialogTitle className="text-base font-semibold text-gray-900">Summary</DialogTitle>
                </div>
                <div className="relative mt-6 flex-1 px-4 sm:px-6">{/* Your content */}
                  {cartItems.length === 0 ? (
                    <p className="text-center text-gray-500">No items in the cart.</p>
                  ) : (
                    <ul>
                      {cartItems.map((item, index) => (
                        <li key={index} className="mb-4">
                          <h4 className="font-semibold">{item.title}</h4>
                          <p>Price: ₹{item.price}</p>
                          <p>Add-Ons: {item.addOns.join(', ') || 'None'}</p>
                          <hr />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className='flex justify-between px-5 sticky'>
                  <h3>Grand Total: ₹{grandTotal}</h3>
                  <button className='bg-green-500 text-white font-semibold px-5 py-1.5 rounded-xl mb-2 hover:bg-blue-500'>Download BOQ</button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
