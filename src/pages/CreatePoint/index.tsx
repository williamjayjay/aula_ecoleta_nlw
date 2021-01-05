import React, { useEffect, useState, ChangeEvent,FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';

import './styles.css';
import logo from '../../assets/logo.svg';

//Sempre que criar um estado para array ou objeto, precisamos manualmente informar o tipo da variavel que vai ser armazenada ali dentro.

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [selectedUF, setSelectedUF] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  // -22.8684101, -43.2511888
  const [initialPosition, setInitialPosition] = useState<[number, number]>([-15.801074095207468,-47.88751602172852]); //Brasilia
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
  const [posicao, setPosicao] = useState<[number, number]>([0,0]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',

  })

          {/* <Marker position={[-22.8684101, -43.2511888]} /> */}
          // selectedPosition ||

  const history = useHistory();

  useEffect(() => {
    api.get('items').then(response => {
      // console.log(response);
      setItems(response.data);
    })
  }, []);

  useEffect(() => {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
      const ufInitials = response.data.map(uf => uf.sigla);
      setUfs(ufInitials);
      // console.log(ufInitials);
    })
  }, []);

  useEffect(() => {
    //carregar as cidades sempre que a UF mudar
    if (selectedUF === '0'){
      return;
    }

    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`).then(response => {
      const cityNames = response.data.map(city => city.nome);
      setCities(cityNames);
      // console.log(ufInitials);
    })

    // console.log('mudou!!', selectedUF)

  }, [selectedUF]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      console.log(position)
      const { latitude, longitude } = position.coords;
      // console.log(position.coords.latitude)
      setInitialPosition([latitude, longitude]);

      // console.log(latitude, longitude)
      // setPosicao([latitude, longitude]);
      // console.log(posicao)
      // setCounter(counter+1)

    });
  }, []);





  
  // -22.8684101, -43.2511888

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement> ) {
    const uf = event.target.value;

    setSelectedUF(uf);
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement> ) {
    const city = event.target.value;

    setSelectedCity(city);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    // console.log(event.target.value, event.target.name);

    setFormData({ ...formData, [name]:value });
  }

  function handleSelectItem(id: number) {
    const alreadySelected = selectedItems.findIndex(item => item === id);

    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id);
      setSelectedItems(filteredItems);

    } else {
      setSelectedItems([ ...selectedItems, id ])
    }
    // console.log('textin', id);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUF;
    const city = selectedCity;
    const [latitude, longitude] = initialPosition;
    const items = selectedItems;

    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items
    }
    if (data.name != '' && data.email != ''){
      if(data.uf !='0' && data.city !='0'){
        if(data.latitude != 0 && data.longitude != 0){
          if(data.items > [0]){

            return (
              await api.post('points', data),
              alert('Ponto de coleta criado!!'),
              history.push('/')
              );
            
          }

        }

      }

    }
return alert('Por favor, preencha todos os campos.')
    
  }
 
  const Markers = () => {

    const map = useMapEvents({
      click(e) {
        setInitialPosition([
          e.latlng.lat,
          e.latlng.lng
        ]);
        console.log(e.latlng.lat, e.latlng.lng,)
      }
    })

    return (
      <Marker position={initialPosition} />
      // selectedPosition ? 
      //   <Marker key={selectedPosition[0]}
      //     position={selectedPosition}
      //     interactive={false}
      //   />
      // : null

    )

  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>

        <Link to="/" >
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit} >
        <h1>Cadastro do<br/> ponto de coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input 
            type="text"
            name="name"
            id="name"  
            onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input 
              type="email"
              name="email"
              id="email"  
              onChange={handleInputChange}
              
              />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input 
              type="text"
              name="whatsapp"
              id="whatsapp"  
              onChange={handleInputChange}

              />
            </div>
          </div>

        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <MapContainer center={initialPosition} zoom={3.5}  >
            <Markers />

            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

          {/* <Marker position={[-22.8684101, -43.2511888]} /> */}
            
          </MapContainer>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" value={selectedUF} onChange={handleSelectUf} >
                <option value="0">Selecione uma UF</option>

                {ufs.map(uf => (
                <option key={uf} value={uf}>{uf}</option>
                ))}

              </select>
            </div>

            <div className="field">

              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" value={selectedCity} onChange={handleSelectCity} >
                <option value="0">Selecione uma cidade</option>
                


                {cities.map(city => (
                <option key={city} value={city}>{city}</option>
                ))}

              </select>
            </div>

          </div>

        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(item => (
                <li key={item.id} onClick={() => handleSelectItem(item.id)} className={selectedItems.includes(item.id) ? 'selected' : ''} >
                <img src={item.image_url} alt={item.title}/>
                <span>{item.title}</span>
              </li>
            ) )}
  
          </ul>
        </fieldset>

        <button type="submit">
          Cadastrar ponto de coleta
        </button>

      </form>

    </div>
  )
};

export default CreatePoint;