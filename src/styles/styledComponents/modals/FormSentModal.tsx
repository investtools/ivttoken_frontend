import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { useRouter } from 'next/router'
import { Translate } from "translate/translate"


interface IncompleteFieldsModalProps {
  closeModal: () => void
  locale: string
}

export default function FormSentModal({ closeModal, locale }: IncompleteFieldsModalProps) {
  const [isOpen] = useState(true)
  const router = useRouter()
  const t = new Translate(locale)

  const handleModalClose = () => {
    void router.push('/')
    closeModal
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={handleModalClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 text-center"
                  >
                    {t.t("Responses successfully submitted!")}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 text-center">
                      {t.t("We have received the submitted data and are processing it.")}<br />
                      {t.t("Thank you very much! :)")}
                    </p>
                  </div>

                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-ivtcolor2 px-4 py-2 text-sm font-medium text-white hover:bg-ivtcolor2hover focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={handleModalClose}
                    >
                      {t.t("Got it!")}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}