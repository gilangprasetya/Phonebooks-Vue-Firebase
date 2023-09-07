<script>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faFloppyDisk, faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

export default {
    props: {
        id: Number,
        name: String,
        phone: String,
        avatar: String,
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
    },
};
</script>

<template>
    <li class="card">
        <div class="image">
            <img :src="avatar ? avatar : '/user.png'" class="img-fluid" alt="User" @click="handleImageClick" />
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