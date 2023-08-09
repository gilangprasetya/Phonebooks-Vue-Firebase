<script>
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faFloppyDisk, faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";

export default {
    props: {
        id: Number,
        name: String,
        phone: String,
        avatar: String,
        data: Array,
        setData: Function,
    },
    components: {
        FontAwesomeIcon,
    },
    data() {
        return {
            isEditing: false,
            editedName: this.name,
            editedPhone: this.phone,
            showConfirmModal: false,
            icons: { faFloppyDisk, faPenToSquare, faTrashCan },
        };
    },
    methods: {
        handleImageClick() {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.addEventListener("change", (event) => {
                const file = event.target.files[0];
                const formData = new FormData();
                formData.append("avatar", file);

                axios
                    .put(`http://localhost:3001/api/phonebooks/${this.id}/avatar`, formData)
                    .then((response) => {
                        this.updateAvatar(this.id, response.data.data.avatar);
                    })
                    .catch((error) => {
                        console.error("Error updating avatar:", error);
                    });
                window.location.reload();
            });
            fileInput.click();
        },
        updateAvatar(contactId, newAvatar) {
            const updatedData = this.data.map((contact) => {
                if (contact.id === contactId) {
                    return {
                        ...contact,
                        avatar: newAvatar,
                    };
                }
                return contact;
            });
            this.setData(updatedData);
        },
        handleEditClick() {
            this.isEditing = true;
        },
        handleSaveClick(event) {
            event.preventDefault();
            this.updateContact();
        },
        async updateContact() {
            try {
                await axios.put(`http://localhost:3001/api/phonebooks/${this.id}`, {
                    name: this.editedName,
                    phone: this.editedPhone,
                });
                this.isEditing = false;
            } catch (error) {
                console.error("Error updating contact:", error);
            }
        },
        handleDelete() {
            this.showConfirmModal = true;
        },
        handleConfirmDelete() {
            axios
                .delete(`http://localhost:3001/api/phonebooks/${this.id}`)
                .then(() => {
                    window.location.reload();
                })
                .catch((error) => {
                    console.error("Error deleting contact:", error);
                });
        },
        handleCancelDelete() {
            this.showConfirmModal = false;
        },
        handleMouseOver(event) {
            event.target.style.cursor = "pointer";
        },
        handleMouseOut(event) {
            event.target.style.cursor = "auto";
        },
    },
};
</script>

<template>
    <li class="card">
        <div class="image">
            <img :src="avatar ? `http://localhost:3001/images/${avatar}` : '/user.png'" class="img-fluid" alt="User"
                @click="handleImageClick" />
        </div>
        <div class="info">
            <template v-if="isEditing">
                <!-- Show input fields during edit mode -->
                <form @submit.prevent="handleSaveClick">
                    <input type="text" v-model="editedName" />
                    <br />
                    <input type="text" v-model="editedPhone" />
                    <br />
                </form>
            </template>
            <template v-else>
                <!-- Show contact details in non-edit mode -->
                <span class="name">{{ editedName }}</span>
                <br />
                <span class="phone">{{ editedPhone }}</span>
                <br />
            </template>
            <br />
            <div class="btn-pd">
                <template v-if="isEditing">
                    <button type="submit" class="btn" @click="handleSaveClick" @mouseover="handleMouseOver"
                        @mouseout="handleMouseOut">
                        <font-awesome-icon :icon="icons.faFloppyDisk" />
                    </button>
                </template>
                <template v-else>
                    <button class="btn" @click="handleEditClick" @mouseover="handleMouseOver" @mouseout="handleMouseOut">
                        <font-awesome-icon :icon="icons.faPenToSquare" />
                    </button>
                    <button class="btn" @click="handleDelete" @mouseover="handleMouseOver" @mouseout="handleMouseOut">
                        <font-awesome-icon :icon="icons.faTrashCan" />
                    </button>

                    <template v-if="showConfirmModal">
                        <div class="confirm-modal">
                            <div class="modal-content">
                                <p>Are you sure you want to delete this contact?</p>
                                <div class="modal-buttons">
                                    <button @click="handleConfirmDelete" class="confirm-button">
                                        Yes, Delete
                                    </button>
                                    <button @click="handleCancelDelete" class="cancel-button">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </template>
                </template>
            </div>
        </div>
    </li>
</template>