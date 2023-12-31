<script>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faFloppyDisk, faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import db from "../../stores/phonebook.js"

export default {
    props: {
        id: String,
        name: String,
        phone: String,
        data: Array,
        setData: Function,
        updateAvatar: Function,
    },
    components: {
        FontAwesomeIcon,
    },
    data() {
        const storage = getStorage();

        return {
            isEditing: false,
            editedName: this.name,
            editedPhone: this.phone,
            showConfirmModal: false,
            icons: { faFloppyDisk, faPenToSquare, faTrashCan },
            avatarUploadTask: null,
            storage: storage,
            avatar: this.avatar,
        };
    },
    methods: {
        async handleAvatarUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const timestamp = Date.now();
            const avatarName = `${timestamp}-${file.name}`;

            const avatarRef = storageRef(this.storage, `avatars/${this.id}/${avatarName}`);

            try {
                this.avatarUploadTask = uploadBytes(avatarRef, file);
                this.avatarUploadTask.then(() => {
                    getDownloadURL(avatarRef)
                        .then((downloadURL) => {
                            this.avatar = downloadURL;
                            this.updateAvatar(this.id, downloadURL);

                            const docRef = doc(db, "contacts", this.id);
                            updateDoc(docRef, { avatarUrl: downloadURL })
                                .then(() => {
                                    console.log("Avatar URL updated in Firestore.");
                                })
                                .catch((error) => {
                                    console.error("Error updating avatar URL in Firestore:", error);
                                });
                        })
                        .catch((error) => {
                            console.error("Error getting download URL:", error);
                        });
                }).catch((error) => {
                    console.error("Error uploading avatar:", error);
                });
            } catch (error) {
                console.error("Error uploading avatar:", error);
            }
        },

        handleImageClick() {
            this.$refs.avatarInput.click();
        },

        async fetchAvatarUrl() {
            const docRef = doc(db, "contacts", this.id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                this.avatar = docSnap.data().avatarUrl;
            }
        },

        handleEditClick() {
            this.isEditing = true;
        },

        async handleSaveClick() {
            try {
                const docRef = doc(db, "contacts", this.id);
                await updateDoc(docRef, { name: this.editedName, phone: this.editedPhone });

                const contactIndex = this.data.findIndex(contact => contact.id === this.id);
                if (contactIndex !== -1) {
                    this.data[contactIndex].name = this.editedName;
                    this.data[contactIndex].phone = this.editedPhone;
                }

                this.isEditing = false;
            } catch (error) {
                console.error("Error saving contact:", error);
            }
        },

        handleDelete() {
            this.showConfirmModal = true;
        },

        async handleConfirmDelete() {
            try {
                const docRef = doc(db, "contacts", this.id);
                await deleteDoc(docRef);

                const contactIndex = this.data.findIndex(contact => contact.id === this.id);
                if (contactIndex !== -1) {
                    this.data.splice(contactIndex, 1);
                }

                this.showConfirmModal = false;
            } catch (error) {
                console.error("Error deleting contact:", error);
            }
        },

        handleCancelDelete() {
            this.showConfirmModal = false;
        },
    },
    mounted() {
        this.fetchAvatarUrl();
    },
};
</script>

<template>
    <li class="card">
        <div class="image">
            <img :src="this.avatar ? this.avatar : '/user.png'" class="img-fluid" alt="User" @click="handleImageClick" />
            <input type="file" accept="image/*" @change="handleAvatarUpload" style="display: none" ref="avatarInput" />
        </div>
        <div class="info">
            <template v-if="isEditing">
                <form @submit.prevent="handleSaveClick">
                    <input type="text" v-model="editedName" />
                    <br />
                    <input type="text" v-model="editedPhone" />
                    <br />
                </form>
            </template>
            <template v-else>
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