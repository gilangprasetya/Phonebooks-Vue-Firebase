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
            totalPages: 1,
            isLoading: false,
            searchKeyword: "",
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
                    this.totalPages = 1;
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
            } catch (error) {
                console.error("Error creating contact:", error);
            }
        },
        handleSearch(keyword) {
            this.searchKeyword = keyword;
            this.currentPage = 1;
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

            return sortedData;
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
                    :phone="contact.phone" :avatar="contact.avatar" :data="data" v-on:updateData="updateData" />
            </ul>
            <div style="height: 350px;"></div>
        </main>
    </div>
</template>
  