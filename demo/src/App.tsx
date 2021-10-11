import {useRef, useState} from 'react'
import {Card, Col, DatePicker, Row} from 'antd';
import './App.css'
import {EntityConfig} from "omj-simulator/src/entity";
import {getTemplate} from "omj-simulator/src/shikigami";

function App() {
  const [redTeam, setRedTeam] = useState<Array<EntityConfig>>([
    getTemplate('normal')
  ])
  const [blueTeam, setBlueTeam] = useState<Array<EntityConfig>>([])
  console.log(redTeam)

  return (
    <div className="App">
      <Row gutter={16}>
        {
          redTeam.map(e =><Col span={4} key={e.name}> <Card>{e.name}</Card></Col>)
        }
      </Row>
      <Row gutter={16}>
        {
          blueTeam.map(e =><Col span={4}  key={e.name}> <Card>{e.name}</Card></Col>)
        }
      </Row>
    </div>
  )
}

export default App
