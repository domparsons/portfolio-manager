import { Button } from '@/components/ui/button'

const Testing = () => {
  const getTransactionData = async () => {
    const response = await fetch('http://localhost:8000/transaction/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    console.log(data)
  }

  return (
    <div className={'flex flex-col gap-4'}>
      <h1 className="text-3xl font-semibold">Testing</h1>
      <p className="text-lg">This is a testing component</p>
      <Button onClick={getTransactionData}>Click me</Button>{' '}
    </div>
  )
}

export default Testing
