import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React from 'react'

type TransactionButtonsProps = {
  setShowTransactionModal: React.Dispatch<React.SetStateAction<boolean>>
  transactionType: 'buy' | 'sell'
  setTransactionType: React.Dispatch<React.SetStateAction<'buy' | 'sell'>>
}

const TransactionButtons: React.FC<TransactionButtonsProps> = ({
  setShowTransactionModal,
  transactionType,
  setTransactionType,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={'bg-green-600'}
          onClick={() => {
            setShowTransactionModal(true)
            setTransactionType('buy')
          }}
        >
          Buy
        </Button>
      </DialogTrigger>
      <DialogTrigger asChild>
        <Button
          className={'bg-red-600'}
          onClick={() => {
            setShowTransactionModal(true)
            setTransactionType('sell')
          }}
        >
          Sell
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transactionType}</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <Input placeholder="Enter amount" />
      </DialogContent>
    </Dialog>
  )
}

export default TransactionButtons
