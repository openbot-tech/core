import 'babel-polyfill'
import { Subject } from 'rxjs'
import './data'

const subject = new Subject()

subject.subscribe((e) => {
  if (e.type === 'data') console.log('DATA', e.data)
})

export default subject
