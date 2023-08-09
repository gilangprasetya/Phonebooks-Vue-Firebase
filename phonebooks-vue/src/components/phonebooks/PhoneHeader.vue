<script>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faArrowUpZA, faArrowDownZA, faUserPlus } from "@fortawesome/free-solid-svg-icons";

export default {
    components: {
        FontAwesomeIcon,
    },
    props: {
        sortOrder: String,
        handleAddContact: Function,
        handleSearch: Function,
    },
    data() {
        return {
            showPopup: false,
            name: "",
            phone: "",
            searchKeyword: "",
            icons: { faArrowUpZA, faArrowDownZA, faUserPlus },
        };
    },
    methods: {
        handleAddButtonClick() {
            this.showPopup = true;
        },
        handleFormSubmit() {
            this.showPopup = false;
            this.handleAddContact(this.name, this.phone);
            this.name = "";
            this.phone = "";
        },
        handleCancelButtonClick() {
            this.showPopup = false;
            this.name = "";
            this.phone = "";
        },
        handleSortClick() {
            this.$emit("updateSortOrder", this.sortOrder === "asc" ? "desc" : "asc");
        },
        setCursor(cursorType) {
            document.body.style.cursor = cursorType;
        },
        handleSearchChange() {
            this.handleSearch(this.searchKeyword);
        },
    },
};
</script>

<template>
    <div class="top-bar">
        <div class="item">
            <button class="filter" @click="handleSortClick" @mouseover="setCursor('pointer')" @mouseout="setCursor('auto')">
                <font-awesome-icon :icon="sortOrder === 'asc' ? icons.faArrowUpZA : icons.faArrowDownZA" />
            </button>
        </div>
        <div class="item search-form">
            <form @submit.prevent>
                <i class="fas fa-solid fa-magnifying-glass"></i>
                <input type="text" id="search" class="search" v-model="searchKeyword" @input="handleSearchChange" />
            </form>
        </div>
        <div class="item">
            <button class="add" @click="handleAddButtonClick" @mouseover="setCursor('pointer')"
                @mouseout="setCursor('auto')">
                <font-awesome-icon :icon="icons.faUserPlus" />
            </button>
        </div>

        <!-- Popup menu -->
        <div v-if="showPopup" class="popup">
            <form @submit.prevent="handleFormSubmit">
                <input type="text" placeholder="Name" v-model="name" />
                <input type="text" placeholder="Phone" v-model="phone" />
                <div class="button-add">
                    <button type="submit">Save</button>
                    <button type="button" @click="handleCancelButtonClick">Cancel</button>
                </div>
            </form>
        </div>
    </div>
</template>  