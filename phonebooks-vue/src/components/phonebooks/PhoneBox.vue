<script>
import PhoneHeader from "./PhoneHeader.vue";
import PhoneList from "./PhoneList.vue";
import db from "../../stores/phonebook.js"
import { collection, getDocs, addDoc } from 'firebase/firestore';

export default {
    components: {
        PhoneHeader,
        PhoneList,
    },
    data() {
        return {
            data: [],
            sortOrder: "asc",
            currentPage: 1,
            pageSize: 13,
            isLoading: false,
            searchKeyword: "",
            totalItems: 0,
        };
    },
    methods: {
        async fetchData() {
            try {
                const query = collection(db, "contacts");
                const snapshot = await getDocs(query);

                if (!snapshot.empty) {
                    const data = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    this.data = data;
                    this.totalItems = data.length;
                    this.updateTotalPages();
                    this.isLoading = false;
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        },
        async handleAddContact(name, phone) {
            try {
                const docRef = await addDoc(collection(db, "contacts"), {
                    name,
                    phone,
                });
                const newContact = { id: docRef.id, name, phone };
                this.data.push(newContact);
                this.totalItems += 1; // Increment totalItems when adding a contact
                this.updateTotalPages();
            } catch (error) {
                console.error("Error creating contact:", error);
            }
        },
        updateAvatar(id, avatarUrl) {
            const contactIndex = this.data.findIndex((contact) => contact.id === id);
            if (contactIndex !== -1) {
                this.data[contactIndex].avatar = avatarUrl;
            }
        },
        handleSearch(keyword) {
            this.searchKeyword = keyword;
            this.currentPage = 1;
            this.updateTotalPages();
        },
        updateSortOrder(newSortOrder) {
            this.sortOrder = newSortOrder;
        },
        updateData(newData) {
            this.data = newData;
        },
        handleScroll() {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200) {
                if (this.currentPage < this.totalPages && !this.isLoading) {
                    this.isLoading = true;
                    this.currentPage += 1;
                }
            }
        },
        updateTotalPages() {
            this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        },
    },
    watch: {
        currentPage() {
            this.fetchData(this.currentPage, this.sortOrder, this.searchKeyword);
        },
        sortOrder() {
            this.fetchData(this.currentPage, this.sortOrder, this.searchKeyword);
        },
        searchKeyword() {
            this.fetchData(this.currentPage, this.sortOrder, this.searchKeyword);
        },
    },
    mounted() {
        this.fetchData(this.currentPage, this.sortOrder, this.searchKeyword);
        window.addEventListener("scroll", this.handleScroll);
    },
    beforeDestroy() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    computed: {
        sortedData() {
            let sortedData = [...this.data];

            if (this.sortOrder === 'asc') {
                sortedData.sort((a, b) => a.name.localeCompare(b.name));
            } else {
                sortedData.sort((a, b) => b.name.localeCompare(a.name));
            }

            if (this.searchKeyword) {
                const keyword = this.searchKeyword.toLowerCase();
                sortedData = sortedData.filter(contact =>
                    contact.name.toLowerCase().includes(keyword) ||
                    contact.phone.includes(this.searchKeyword)
                );
            }

            return sortedData.slice(0, this.currentPage * this.pageSize);
        },
    },
};
</script>

<template>
    <div class="container">
        <header>
            <PhoneHeader v-bind:sortOrder="sortOrder" v-on:updateSortOrder="updateSortOrder"
                :handleAddContact="handleAddContact" :handleSearch="handleSearch" />
        </header>
        <main class="mt-3">
            <ul>
                <PhoneList v-for="contact in sortedData" :key="contact.id" :id="contact.id" :name="contact.name"
                    :phone="contact.phone" :avatar="contact.avatar" :data="data" :updateAvatar="updateAvatar"
                    v-on:updateData="updateData" />
            </ul>
        </main>
    </div>
</template>
  