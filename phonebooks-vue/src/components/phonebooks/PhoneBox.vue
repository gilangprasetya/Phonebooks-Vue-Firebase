<script>
import PhoneHeader from "./PhoneHeader.vue";
import PhoneList from "./PhoneList.vue";
import axios from "axios";

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
        async fetchData(page, sortOrder, keyword = "") {
            try {
                const response = await axios.get("http://localhost:3001/api/phonebooks", {
                    params: { sort: sortOrder, page, keyword },
                });
                if (response.data.phonebooks) {
                    this.data =
                        page === 1
                            ? response.data.phonebooks
                            : this.data.concat(
                                response.data.phonebooks.filter((contact) =>
                                    !this.data.some((existingContact) => existingContact.id === contact.id)
                                )
                            );
                    this.totalPages = response.data.pages;
                    this.isLoading = false;
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        },
        async handleAddContact(name, phone) {
            try {
                const response = await axios.post("http://localhost:3001/api/phonebooks", {
                    name: name,
                    phone: phone,
                });
                const newContact = response.data;
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
                <PhoneList v-for="contact in data" :key="contact.id" :id="contact.id" :name="contact.name"
                    :phone="contact.phone" :avatar="contact.avatar" :data="data" v-on:updateData="updateData" />
            </ul>
            <div style="height: 350px;"></div>
        </main>
    </div>
</template>
  