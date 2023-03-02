

class Note {
    constructor(id, title, text){
        this.id = id;
        this.title = title;
        this.text = text;
    }
}



class Application {

    constructor(){


        this.notes =JSON.parse(localStorage.getItem('notes')) || [];

        this.selectedNoteId = "";
        this.miniSidebar = true;

        this.$selectedNoteId = "";
        this.$activeForm = document.querySelector(".active-form");
        this.$inactiveForm = document.querySelector(".inactive-form");
        this.$noteTitle = document.querySelector("#note-title");
        this.$noteText = document.querySelector("#note-text");
        this.$modalTitle = document.querySelector("#modal-title");
        this.$modalText = document.querySelector("#modal-text");
        this.$notes = document.querySelector(".notes");
        this.$form = document.querySelector("#form");
        this.$modal = document.querySelector(".modal");
        this.$modalForm = document.querySelector("#modal-form");
        this.$closeModalForm = document.querySelector("#modal-button");
        this.$sidebar = document.querySelector(".sidebar");
        this.$sidebarActiveItem = document.querySelector(".active-item");

        this.$application = document.querySelector("#application");
        this.$firebaseAuthContainer = document.querySelector("#firebaseui-auth-container");
        this.$authUserText = document.querySelector(".auth-user");
        this.$logoutButton = document.querySelector(".logout");



        // Initialize the FirebaseUI Widget using Firebase.
        
        this.ui = new firebaseui.auth.AuthUI(firebase.auth());
        this.handleAuth();

        this.addEventListeners();
        this.displayNotes();
    }

    handleAuth() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
              this.redirectToApp();
              this.$authUserText.innerHTML = user.displayName;
              var uid = user.uid;
              // ...
            } else {
              this.redirectToAuth();
            }
            console.log(user)
          });
    }

    handleLogout () {
        firebase.auth().signOut().then(() => {
            alert("You've successfully logged out.");
            this.redirectToAuth();
          }).catch((error) => {
            alert("Apologies, an error occured. error report sent.");
            console.log(error);
          });
    }

    redirectToApp() {
        this.$application.style.display = "block";
        this.$firebaseAuthContainer.style.display = "none";
    }

    redirectToAuth() {
        this.$application.style.display = "none";
        this.$firebaseAuthContainer.style.display = "block";

        this.ui.start('#firebaseui-auth-container', {
            signInOptions: [
              firebase.auth.EmailAuthProvider.PROVIDER_ID,
              firebase.auth.GoogleAuthProvider.PROVIDER_ID
            ],
            // Other config options...
          });
    }

    addEventListeners(){
        document.body.addEventListener("click", (event) => {
            this.handleFormClick(event);
            this.closeModal(event);
            this.openModal(event);
            this.handleArchiving(event);
        })

        this.$form.addEventListener("submit", event => {
            event.preventDefault();
            const title = this.$noteTitle.value;
            const text = this.$noteText.value;
            this.addNote({ title, text });
            this.closeActiveForm ();
        } )

        this.$closeModalForm.addEventListener("click", (event) => {
            event.preventDefault();

        })

        this.$sidebar.addEventListener("mouseover", (event) => {
            this.handleToggleSidebar();
        })

        this.$sidebar.addEventListener("mouseout", (event) => {
            this.handleToggleSidebar();
        
        })

        this.$logoutButton.addEventListener("click", (event) => {
            this.handleLogout();
        })

        
    }

    handleFormClick(event){
        const isActiveFormClickedOn = this.$activeForm.contains(event.target);
        const isInactiveFormClickedOn = this.$inactiveForm.contains(event.target);
        const title = this.$noteTitle.value;
        const text = this.$noteText.value;


        if (isInactiveFormClickedOn) {
            this.openActiveForm();

        } else if (!isInactiveFormClickedOn && !isActiveFormClickedOn){
            this.addNote({ title, text });
            this.closeActiveForm ();
        }

    }

    

    openActiveForm(){
            this.$inactiveForm.style.display = "none";
            this.$activeForm.style.display = "block";
            this.$noteText.focus();
    }

    closeActiveForm(){
            this.$inactiveForm.style.display = "block";
            this.$activeForm.style.display = "none";
            this.$noteTitle.value = "";
            this.$noteText.value = "";
     }

    openModal (event){
        const $selectedNote = event.target.closest(".note");

        if ($selectedNote && !event.target.closest(".archive")){
            this.$selectedNoteId = $selectedNote.id;
            this.$modalTitle.value = $selectedNote.children[1].innerHTML;
            this.$modalText.value = $selectedNote.children[2].innerHTML;
            this.$modal.classList.add("open-modal")
           
         } 
         else {
            return;
        }

        
    }

    closeModal(event){
        const isModalFormClickedOn = this.$modalForm.contains(event.target);
        const isCloseModalButtonClickedOn = this.$closeModalForm.contains(event.target)

        if((!isModalFormClickedOn || isCloseModalButtonClickedOn) && this.$modal.classList.contains("open-modal")){
            this.editNote(this.$selectedNoteId, {title: this.$modalTitle.value, text: this.$modalText.value});
            this.$modal.classList.remove("open-modal")
            
        }
    }

    handleArchiving(event){
        const $selectedNote = event.target.closest(".note");

        if ($selectedNote && event.target.closest(".archive")) {
            this.$selectedNoteId = $selectedNote.id;
            this.deleteNote(this.$selectedNoteId)
         } 
         else {
            return;
        }
    }

    addNote ({title, text}) {
        if (text != ""){
            const newNote = new Note (cuid(), title, text);
            this.notes = [...this.notes, newNote]
            this.render();
        }
      
    }

    editNote (id, {title, text}) {
        this.notes.map (note => {
            if (note.id == id) {
                note.title = title;
                note.text = text;
            }
            return note;
        })
        this.render();
    }

    deleteNote(id){
        this.notes = this.notes.filter(note => note.id != id);
        this.render()
    }

    handleMouseOverNote(element) {

        const $note = document.querySelector("#" + element.id);

        const $checkNote = $note.querySelector(".check-circle");
        $checkNote.style.visibility = "visible";

        const $noteFooter = $note.querySelector(".footer-note");
        $noteFooter.style.visibility = "visible";
    }

    handleMouseOutNote(element) {
    
        const $note = document.querySelector("#" + element.id);

        const $checkNote = $note.querySelector(".check-circle");
        $checkNote.style.visibility = "hidden";

        const $noteFooter = $note.querySelector(".footer-note");
        $noteFooter.style.visibility = "hidden";
    }

    handleToggleSidebar() {

        if(this.miniSidebar){

            this.$sidebar.style.width = "250px";
            this.$sidebar.classList.add("sidebar-hover");
            this.$sidebarActiveItem.classList.add("sidebar-active-item");
            this.miniSidebar = false;

        }
        else {

            this.$sidebar.style.width = "80px";
            this.$sidebar.classList.remove("sidebar-hover");
            this.$sidebarActiveItem.classList.remove("sidebar-active-item");
            this.miniSidebar = true;
        }
    }


saveNotes(){
    localStorage.setItem('notes', JSON.stringify(this.notes));
}

render(){
    this.saveNotes ();
    this.displayNotes();
}


    displayNotes(){

        this.$notes.innerHTML = this.notes.map((note) => 
            `
            <div class="note" id = "${note.id}" onmouseover = "application.handleMouseOverNote(this)" onmouseout = "application.handleMouseOutNote(this)">
                <span class="material-symbols-outlined check-circle">
                    check_circle
                </span>
                <div class="title-note">${note.title}</div>
                <div class="text-note">${note.text}</div>
                <div class="footer-note">
                    <div class="tooltip">
                        <span class="material-symbols-outlined hover small-icon">
                            add_alert
                        </span>
                        <span class="tooltip-text">Remind me</span>
                    </div>
                    <div class="tooltip">
                        <span class="material-symbols-outlined hover small-icon">
                            person_add
                        </span>
                        <span class="tooltip-text">Collaborator</span>
                    </div>
                    <div class="tooltip">
                        <span class="material-symbols-outlined hover small-icon">
                            palette
                        </span>
                        <span class="tooltip-text">Background options</span>
                    </div>
                    <div class="tooltip">
                        <span class="material-symbols-outlined hover small-icon">
                            image
                        </span>
                        <span class="tooltip-text">Add image</span>
                    </div>
                    <div class="tooltip archive">
                        <span class="material-symbols-outlined hover small-icon">
                            archive
                        </span>
                        <span class="tooltip-text">Archive</span>
                    </div>
                    <div class="tooltip">
                        <span class="material-symbols-outlined hover small-icon">
                            more_vert
                        </span>
                        <span class="tooltip-text">More</span>
                    </div>
                </div>
            </div>`
            
            ).join("");


        
    }
}


const application = new Application();
