import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import db from "./DexieDB";
import { uuid } from 'vue-uuid';
import { importDB, exportDB} from "dexie-export-import";
import router from './router'
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
  data(){
    return{
      db,
      importDB,
      exportDB,
      uuid,
      DBexists: false,
      shadowDB: {},
      windowID: null,
      isElectron : process.env.IS_ELECTRON,
      dbloaded: false,
      fileinfo :{
        location : null,
        type : null
      }
    }
  },
  methods:{
    importFile(data){
      console.log("Import", JSON.parse(data))
    },
    async export_db(){
      let result =  await this.exportDB(this.db,{
        prettyJson: true,
        progressCallback: ({ totalRows, completedRows }) => {
          console.log(
            `Progress: ${completedRows} of ${totalRows} rows completed`
          );
        },
      })
      return result
    },
    async  import_db(blob){
      await this.db.delete()
      await this.importDB(this.db,blob,
        {
          prettyJson: true,
          progressCallback: ({ totalRows, completedRows }) => {
            console.log(
              `Progress: ${completedRows} of ${totalRows} rows completed`
            );
          },
        }
        
        )
    },
    AddRecord(myTable, myData) {
     // console.log("AddRecord",myTable,myData)
      myData.lastupdated = Date.now();
      this.$root.db.transaction('rw', myTable, tx => {
        tx.source = null; // an INSERT should fire the update  on the shadowDB 
        this.db[myTable].add(myData);
      }).then(
 //      console.log("Add Complete")
      )
    },
    UpdateRecord(myTable, myKey, myData) {
      myData.uuid = myKey;
      myData.lastupdated = Date.now();
      console.log("UpdateRecord",myTable, myKey, myData)
      this.$root.db.transaction('rw', myTable, tx => {
        tx.source = this.windowID  // updates are going to be massively more common - so do them manually to the object
        this.shadowDB[myTable][myKey] =  myData;
        this.$root.db[myTable].put(myData)
      }).then(
  //      console.log("Update Complete")
      )

    },
    DeleteRecord(myTable, myKey) {
   //   console.log("DeleteRecord", myTable, myKey)
      this.$root.db.transaction('rw', myTable, tx => {
        tx.source = null; // a DELETE should fire the update on the shadowDB 
        this.$root.db[myTable].delete(myKey)
      }).then(
  //      console.log("Delete Complete")
      )
    },
    checkDB(){
      if (Object.keys(this.$root.shadowDB.Settings).length) {
        console.log("LOADED Shadow Database", this.$root.shadowDB.Settings);
        this.$root.interface.MainNavigationToggle = true;
      } else {
        window.wmlog("No DB found in memory - load a file/ create new", "error"); 
        this.$root.DBexists=false
      }
    }
  },
  beforeMount() {
    this.windowID = this.$root.uuid.v4() // each window generates a unique ID so it knows who is doing the emitting of changes
    /*
    The Shadow DB is a Reactive Object copy of the database
    You  WRITE to the shadowDB and save it to the database and it will emit changes to all (other) windows
    This bit here simply constructs the shadowDB object from the database
    */
    let dbcounter = 0
    let dblimit = 0
    this.db.tables.forEach((table) => {

      if (table.name.charAt(0) != "_") {  // avoid the system tables
        dblimit++
        this.$set(this.shadowDB, table.name, {})    // can't just ASSIGN as it wont be reactive so set it using VUE 
        this.db[table.name].each((r) => {
          this.$set(this.shadowDB[table.name], r.uuid, r)     // can't just ASSIGN as it wont be reactive so set it using VUE
        }).then(() => {
          dbcounter++
          if (dbcounter === dblimit) {
            this.dbloaded = true
            this.checkDB()
          } 
        })
      }
    })

  },
  mounted() {
    this.$root.db.on("changes", (changes) => {
      changes.forEach((change) => {
        if (change.source != this.windowID) { // using transactions allows me to filter updates out of the window that sent them (just causes lag occasionanly)
          switch (change.type) {
            case 1: // CREATED
              this.$set(this.shadowDB[change.table], change.key, change.obj)   // can't just ASSIGN as it wont be reactive so set it using VUE
              break;
            case 2: // UPDATED
              this.$root.shadowDB[change.table][change.key] = change.obj
              break;
            case 3: // DELETED
              this.$delete(this.$root.shadowDB[change.table],change.key)
              break;
          }
        } 
      })
    })
  }
}).$mount('#app')
