import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { Translate } from "translate/translate"
import SendIcon from '../icons/SendIcon'
import XMark from '../icons/XMarkIcon'
import FormSentModal from './FormSentModal'
import IncompleteFieldsModal from './IncompleteFieldsModal'
import { api } from '~/utils/api'

interface AnswerModalProps {
  closeModal: () => void
  locale: string
  ispName: string
  helpSubject: string
  helpMessage: string
  ispEmail: string
  helpId: string
}

export default function AnswerModal({ closeModal, locale, ispName, helpSubject, helpMessage, ispEmail, helpId }: AnswerModalProps) {
  const t = new Translate(locale)
  const [isOpen] = useState(true)
  const [message, setMessage] = useState("")
  const [subject, setSubject] = useState(`Re: ${helpSubject}`)
  const [sentFormModalIsOpen, setSentFormModalIsOpen] = useState(false)
  const [incompleteFieldsModalIsOpen, setIncompleteFieldsModalIsOpen] = useState(false)

  const { mutate } = api.admin.answerISP.useMutation()

  const handleSubmit = (subject: string, message: string, to: string, helpId: string) => {
    if (!subject || !message) return setIncompleteFieldsModalIsOpen(true)
    mutate({ message, subject, to, helpId })
    setSentFormModalIsOpen(true)
  }

  const handleCloseSentFormModal = () => {
    setSentFormModalIsOpen(false)
    closeModal()
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={closeModal}>
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
                <Dialog.Panel className="hover:scale-110 duration-500 hover:shadow-2xl hover:border-ivtcolor2 hover:border-2 w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  {sentFormModalIsOpen && (
                    <FormSentModal closeModal={handleCloseSentFormModal} locale={locale} />
                  )}
                  {incompleteFieldsModalIsOpen && (
                    <IncompleteFieldsModal closeIncompleteFieldModal={() => setIncompleteFieldsModalIsOpen(false)} locale={locale} />
                  )}
                  <div className="flex justify-between items-center">
                    <Dialog.Title as="h3" className="font-extrabold text-2xl leading-6 text-ivtcolor2">
                      {t.t("Answer")}
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="slide-in-blurred-top inline-flex justify-center rounded-full border border-transparent bg-ivtcolor font-bold text-white hover:bg-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                      <XMark />
                    </button>
                  </div>
                  <div className="mt-2">
                    <div className="mb-4">
                      <label className="block text-ivtcolor2 font-bold mb-2" htmlFor="subject">
                        {t.t("Provider")}
                      </label>
                      <div className='shadow appearance-none border w-full py-2 px-3 text-ivtcolor2 leading-tight  focus:shadow-outline focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 border-ivtcolor p-2 rounded-lg focus-visible:ring-offset-ivtcolor'>
                        {ispName}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-ivtcolor2 font-bold mb-2" htmlFor="subject">
                        {t.t("Subject")}
                      </label>
                      <div className='shadow appearance-none border w-full py-2 px-3 text-ivtcolor2 leading-tight  focus:shadow-outline focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 border-ivtcolor p-2 rounded-lg focus-visible:ring-offset-ivtcolor'>
                        {helpSubject}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-ivtcolor2 font-bold mb-2" htmlFor="subject">
                        {t.t("Message")}
                      </label>
                      <div className='shadow appearance-none border w-full py-2 px-3 text-ivtcolor2 leading-tight  focus:shadow-outline focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 border-ivtcolor p-2 rounded-lg focus-visible:ring-offset-ivtcolor'>
                        {helpMessage}
                      </div>
                    </div>

                    <div className='grid grid-cols-3 items-center'>
                      <div className='border-b-2 border-gray-200 mx-4'></div>
                      <span className='md:text-lg text-sm text-ivtcolor2 font-extrabold text-center'>{t.t("Your Response")}:</span>
                      <div className='border-b-2 border-gray-200 mx-4'></div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-ivtcolor2 font-bold mb-2" htmlFor="subject">
                        {t.t("Subject")}
                      </label>
                      <input
                        className="shadow appearance-none border w-full py-2 px-3 text-ivtcolor2 leading-tight  focus:shadow-outline focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 border-ivtcolor p-2 rounded-lg focus-visible:ring-offset-ivtcolor"
                        id="subject"
                        type="text"
                        placeholder={t.t("Subject")}
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />
                    </div>

                    <div className="mb-2">
                      <label className="block text-ivtcolor2 font-bold mb-2" htmlFor="message">
                        {t.t("Message")}
                      </label>
                      <textarea
                        className="shadow appearance-none border w-full py-2 px-3 text-ivtcolor2 leading-tight  focus:shadow-outline focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 border-ivtcolor p-2 rounded-lg focus-visible:ring-offset-ivtcolor"
                        id="message"
                        placeholder={t.t("Message")}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      className="gradient-animation font-bold inline-flex items-center justify-center rounded-full border border-transparent px-4 py-2 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      onClick={(event) => {
                        event.preventDefault()
                        handleSubmit(subject, message, ispEmail, helpId)
                      }}
                    >
                      {t.t('Send')}
                      <SendIcon />
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
