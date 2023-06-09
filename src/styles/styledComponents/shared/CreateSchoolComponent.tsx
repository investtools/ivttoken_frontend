import { Listbox } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import FormSentModal from "~/styles/styledComponents/modals/FormSentModal"
import IncompleteFieldsModal from "~/styles/styledComponents/modals/IncompleteFieldsModal"
import SendIcon from "~/styles/styledComponents/icons/SendIcon"
import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from "next/router"
import { Translate } from "translate/translate"
import InputMask from 'react-input-mask'
import { validateEmail, type ViaCEPAddress } from "~/utils/functions/adminFunctions"
import InvalidEmailModal from "~/styles/styledComponents/modals/InvalidEmailModal"
import PageHeader from "~/styles/styledComponents/shared/PageHeader"
import { selectField } from "~/styles/styledComponents/shared/selectFieldForms"
import XMark from '../icons/XMarkIcon'
import type { inferRouterInputs } from '@trpc/server'
import { type AppRouter } from '~/server/api/root'
import CaptchaModal from '../modals/CaptchaModal'
import Captcha from './Captcha'

type RouterInput = inferRouterInputs<AppRouter>
type PageMutate = RouterInput['admin']['createSchool']
type ModalMutate = RouterInput['schools']['schoolToBeApproved']

type PageMutateFunction = (input: PageMutate) => void
type ModalMutateFunction = (input: ModalMutate) => void

type CreateSchoolComponentProps = {
  isModal: boolean
  mutate: PageMutateFunction | ModalMutateFunction
  closeModal: () => void
}

const CreateSchoolComponent: React.FC<CreateSchoolComponentProps> = ({ isModal, mutate, closeModal }) => {
  const [name, setName] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [address, setAddress] = useState('')
  const [number, setNumber] = useState('')
  const [inepCode, setInepCode] = useState('')
  const [email, setEmail] = useState('')
  const [administrator, setAdministrator] = useState('')
  const [incompleteFieldsModalIsOpen, setIncompleteFieldsModalIsOpen] = useState(false)
  const [captchaModalIsOpen, setCaptchaModalIsOpen] = useState(false)
  const [verified, setVerified] = useState(false)
  const [invalidEmailIsOpen, setInvalidEmailIsOpen] = useState(false)
  const [sentFormModalIsOpen, setSentFormModalIsOpen] = useState(false)
  const [optionsWidth, setOptionsWidth] = useState(0)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const router = useRouter()
  const locale = router.locale === undefined ? 'en' : router.locale
  const t = new Translate(locale)

  useEffect(() => {
    if (buttonRef.current) {
      setOptionsWidth(buttonRef.current.getBoundingClientRect().width)
    }
  }, [administrator])

  const handleSubmit = (name: string, state: string, city: string, zipCode: string, address: string, number: number, inepCode: string, email: string, administrator: string) => {
    if (!name || !state || !city || !zipCode || !address || !inepCode || !email || !administrator || !number) return setIncompleteFieldsModalIsOpen(true)
    if (validateEmail(email) === false) return setInvalidEmailIsOpen(true)

    const inputData = { name, state, city, zipCode, address: address + ", " + String(number), inepCode, email, administrator: String(administrator) }
    if (isModal) {
      if (verified === false) {
        return setCaptchaModalIsOpen(true)
      }
      (mutate as ModalMutateFunction)(inputData as ModalMutate)
    } else {
      (mutate as PageMutateFunction)(inputData as PageMutate)
    }
    setSentFormModalIsOpen(true)
  }

  const fetchAddress = async (zipCode: string) => {
    if (zipCode.length === 9) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`)
        const data = await response.json() as ViaCEPAddress

        if (!data.erro) {
          setAddress(data.logradouro)
          setCity(data.localidade)
          setState(data.uf)
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  const handleCloseModal = () => {
    setSentFormModalIsOpen(false)
    closeModal()
  }

  const handleSent = () => {
    setSentFormModalIsOpen(false)
    void router.push('/')
  }

  const handleCaptchaResponse = (response: string | null): void => {
    if (response) {
      setVerified(true)
    }
  }

  return (
    <>
      <PageHeader title={t.t("Create School")} />
      {sentFormModalIsOpen && (
        <FormSentModal closeModal={isModal ? handleCloseModal : handleSent} locale={locale} />
      )}
      {incompleteFieldsModalIsOpen && (
        <IncompleteFieldsModal closeIncompleteFieldModal={() => setIncompleteFieldsModalIsOpen(false)} locale={locale} />
      )}
      {invalidEmailIsOpen && (
        <InvalidEmailModal closeModal={() => setInvalidEmailIsOpen(false)} locale={locale} />
      )}
      {captchaModalIsOpen && (
        <CaptchaModal closeModal={() => setCaptchaModalIsOpen(false)} locale={locale} />
      )}
      <div className="flex justify-center items-top p-5">
        <form className="bg-white p-10 rounded-lg">
          {isModal &&
            (<div className="flex justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="slide-in-blurred-top inline-flex justify-center rounded-full border border-transparent bg-ivtcolor font-bold text-white hover:bg-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                <XMark />
              </button>
            </div>)
          }
          <h1 className="text-center text-2xl font-bold mb-8 text-ivtcolor2">{t.t(isModal ? "Send School To Analysis" : "Create New School")}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col mb-4">
              <label htmlFor="name" className="mb-2 font-bold text-lg text-ivtcolor2">
                {t.t("School's Name")}:
              </label>
              <input
                placeholder="E.E. João e Maria"
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={selectField}
              />
            </div>
            <div className="flex flex-col mb-4">
              <label htmlFor="zipCode" className="mb-2 font-bold text-lg text-ivtcolor2">
                {t.t("Zip Code")}:
              </label>
              <InputMask
                mask="99999-999"
                placeholder="00000-000"
                type="text"
                id="zipCode"
                value={zipCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setZipCode(e.target.value)
                  void fetchAddress(e.target.value)
                }}
                required
                className={selectField}
              />
            </div>
            <div className="flex flex-col mb-4">
              <label htmlFor="state" className="mb-2 font-bold text-lg text-ivtcolor2">
                {t.t("State")}:
              </label>
              <input
                placeholder="São Paulo"
                type="text"
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className={selectField}
              />
            </div>
            <div className="flex flex-col mb-4">
              <label htmlFor="city" className="mb-2 font-bold text-lg text-ivtcolor2">
                {t.t("City")}:
              </label>
              <input
                placeholder="São Paulo"
                type="text"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className={selectField}
              />
            </div>
            <div className="flex flex-col mb-4">
              <label htmlFor="address" className="mb-2 font-bold text-lg text-ivtcolor2">
                {t.t("Address")}:
              </label>
              <input
                placeholder="Rua A"
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className={selectField}
              />
            </div>
            <div className="flex flex-col mb-4">
              <label htmlFor="number" className="mb-2 font-bold text-lg text-ivtcolor2">
                {t.t("Number")}:
              </label>
              <input
                placeholder="1965"
                type="number"
                id="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
                className={selectField}
              />
            </div>
            <div className="flex flex-col mb-4">
              <label htmlFor="inepCode" className="mb-2 font-bold text-lg text-ivtcolor2">
                {t.t("Inep Code")}:
              </label>
              <InputMask
                mask="99999999"
                placeholder="12345678"
                type="text"
                id="inepCode"
                value={inepCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInepCode(e.target.value)}
                required
                className={selectField}
              />
            </div>
            <div className="flex flex-col mb-4">
              <label htmlFor="email" className="mb-2 font-bold text-lg text-ivtcolor2">
                {t.t("E-Mail")}:
              </label>
              <input
                placeholder="email@domain.com"
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={selectField}
              />
            </div>
            <div className="flex flex-col mb-4">
              <label
                htmlFor="administrator"
                className="mb-2 font-bold text-lg text-ivtcolor2"
              >
                {t.t("Administrator")}:
              </label>
              <Listbox value={administrator} onChange={(e) => setAdministrator(e.valueOf())}>
                <Listbox.Button ref={buttonRef} className="h-full relative w-full py-2 pl-3 pr-10 text-left bg-white rounded-lg shadow-md cursor-default focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-ivtcolor sm:text-sm">
                  <span className="block truncate text-gray-900">
                    {t.t(administrator) || t.t("Select an Administrator")}
                  </span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronUpDownIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  </span>
                </Listbox.Button>
                <Listbox.Options className="absolute py-1 mt-1 overflow-auto text-base text-gray-900 bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm" style={{ width: optionsWidth }}>
                  <Listbox.Option
                    className={({ active }) =>
                      `${active ? "text-white bg-ivtcolor" : "text-gray-900"
                      } cursor-default select-none relative py-2 pl-10 pr-4`}
                    value="State"
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                            }`}
                        >
                          {t.t("State")}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-ivtcolor2">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                  <Listbox.Option
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-ivtcolor text-white' : 'text-gray-900'
                      }`
                    }
                    value="Municipality"
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                            }`}
                        >
                          {t.t("Municipality")}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-ivtcolor2">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                </Listbox.Options>
              </Listbox>
            </div>
            <div className="flex items-center justify-center mt-4">
              <button
                onClick={(event) => {
                  event.preventDefault()
                  handleSubmit(
                    name,
                    state,
                    city,
                    zipCode,
                    address,
                    Number(number),
                    inepCode,
                    email,
                    administrator
                  )
                }}
                type="submit"
                className="whitespace-nowrap w-full border border-transparent shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ivtcolor text-white font-bold py-2 px-4 rounded-full gradient-animation">
                <span className="flex items-center justify-center">
                  {t.t("Create School")}
                  <SendIcon />
                </span>
              </button>
            </div>
          </div>

          {isModal && (
            <div className='flex justify-center md:mt-2 mt-10'>
              <Captcha onChange={handleCaptchaResponse} />
            </div>
          )}

          {isModal &&
            (<span className="text-gray-500 flex text-center mt-4">
              {t.t("Please note that the submitted school will be subject to review by an administrator before being approved. Thank you for your patience.")}
            </span>)
          }
        </form>
      </div >
    </>
  )
}

export default CreateSchoolComponent
