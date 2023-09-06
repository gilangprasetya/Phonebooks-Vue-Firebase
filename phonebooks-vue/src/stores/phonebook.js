import { defineStore } from 'pinia'
import axios from 'axios'

const request = axios.create({
    baseURL: "https://phonebooks-ea7c3-default-rtdb.firebaseio.com/",
    timeout: 10000
})

export const useContactsStore = defineStore('contacts', () => {
    const contacts = ref ([])

    async function loadContact() {
        try {
            const contacts = await request.get('phonebookdb.json')
        } catch (e) {
            console.log(e)
        }
    }

    async function addContact(contact) {

    }

    return { loadContact, addContact }

})