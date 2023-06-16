import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { type Schools } from '@prisma/client'
import { Translate } from 'translate/translate'
import 'leaflet-defaulticon-compatibility'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import SearchIcon from '../icons/SearchIcon'
import { api } from "~/utils/api"
import Loading from './Loading'
import { type Map } from 'leaflet'

type SchoolMapProps = {
    locale: string
    schools: Schools[]
}

type Coords = {
    lat: number
    lon: number
}

const UpdatePosition: React.FC<{ coordinates: Coords }> = ({ coordinates }) => {
    const map: Map = useMap()

    useEffect(() => {
        if (coordinates) {
            map.flyTo([coordinates.lat, coordinates.lon], map.getZoom())
        }
    }, [coordinates, map])
    return null
}

const SchoolMap: React.FC<SchoolMapProps> = ({ schools, locale }) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [userCity, setUserCity] = useState("")
    const [coordinates, setCoordinates] = useState<{ lat: number, lon: number }>({ lat: -22.89384, lon: -43.19700 })
    const t = new Translate(locale)

    const { data } = api.schools.getLatLon.useQuery({ input: userCity })

    useEffect(() => { setIsLoaded(typeof window !== "undefined") }, [])

    useEffect(() => {
        if (data) setCoordinates({ lat: data.lat, lon: data.lon })
    }, [data])

    if (!isLoaded) return <Loading locale={locale} />

    return (
        <div>
            <div className="flex items-center justify-center mb-2 text-ivtcolor2 font-bold">
                <label htmlFor="search" className="mr-2">{t.t("Search:")}</label>
                <div className="relative">
                    <input className="rounded-full border-[3px] focus:border-hover border-ivtcolor p-1 focus:outline-none focus:ring focus:ring-transparent hover:drop-shadow-xl mr-2 pl-8" placeholder={"Paraty, RJ"} id="search" type="text" value={userCity} onChange={e => setUserCity(e.target.value)} />
                    <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none ">
                        <SearchIcon />
                    </div>
                </div>
            </div>
            <MapContainer className='map' center={[coordinates.lat, coordinates.lon]} zoom={14}>
                <UpdatePosition coordinates={coordinates} />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[coordinates.lat, coordinates.lon]}>
                    <Popup>{t.t("You are here!")}</Popup>
                </Marker>
                {schools.map((school) => (
                    <Marker key={school.id} position={[Number(school.lat), Number(school.lon)]}>
                        <Popup>
                            {school.name}<br />
                            {school.address}<br />
                            {school.tokens}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    )
}

export default SchoolMap
