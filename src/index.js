import 'babel-polyfill'
import { Subject } from 'rxjs'
import './market'

const subject = new Subject()

subject.subscribe((e) => {
  if (e.type === 'market') console.log('market', e.data)
})

export default subject
