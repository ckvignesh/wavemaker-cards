<template>
  <div>
    <v-navigation-drawer v-model="drawer" app clipped :width="340">
      <Manuscript
        :list="
          $root.shadowDB.Writer[$route.params.id]
        "
      />
    </v-navigation-drawer>

      <v-navigation-drawer v-model="notedrawer" app right clipped :width="340" v-if="$root.writer.activenode.type === 'file'">
     <NotesPanel />
    </v-navigation-drawer>

        <v-app-bar dense class="sticky" color="c9"   elevation="0">
   <v-btn icon   @click="drawer = !drawer">
          <v-icon v-if="drawer">menu_open</v-icon>
          <v-icon v-else>menu</v-icon>
        </v-btn>
 <v-spacer></v-spacer>
          <v-btn icon  @click="notedrawer = !notedrawer" v-if="$root.writer.activenode.type === 'file'">
          <v-icon v-if="notedrawer">speaker_notes_off</v-icon>
          <v-icon v-else>speaker_notes</v-icon>
        </v-btn>
    </v-app-bar>
      <v-container fluid > 


        <div v-if="$root.writer.activenode.type" class="wm_manuscripteditor">
          <div v-if="$root.writer.activenode.type === 'file'">
            <v-row justify="center" >
              <v-col >
       
                 <manuscript-editor 
                  :uuid="$root.writer.activenode.uuid"
                  :key="$root.writer.activenode.uuid"
                />
                
                 </v-col
            ></v-row>
          </div>
          <div v-else>
            <v-row justify="center">
              <v-col sm="12">
                <v-text-field
                  v-model="$root.writer.activenode.title"
                  filled
                  type="text"
                  @change="SaveChange()"
                ></v-text-field>
                <text-viewer :folder="$root.writer.activenode" />
              </v-col>
            </v-row>
          </div>
        </div>
        <div v-else>
                <v-row justify="center">
              <v-col cols="10" md="10" lg="8">
                
               <v-text-field
                  v-model="$root.shadowDB.Writer[$route.params.id].title"
                  filled
                  label="Title"
                  type="text"
                  @change="SaveChange()"
                ></v-text-field>
 by
                 <v-text-field
                   v-model="$root.shadowDB.Writer[$route.params.id].author"
                  filled
                  label="Author"
                  type="text"
                  @change="SaveChange()"
                ></v-text-field>
              </v-col>
              </v-row>
        </div>
      </v-container>

    
  </div>
</template>

<script>
import Manuscript from "@/tools/writer/Manuscript";
import NotesPanel from "@/tools/writer/NotesPanel";

import ManuscriptEditor from "@/tools/writer/ManuscriptEditor.vue";
import TextViewer from "@/tools/writer/TextViewer.vue";
export default {
  data() {
    return {
      drawer: true,
      notedrawer : true
    };
  },
  components: {
    Manuscript,
    NotesPanel,
    TextViewer,
    ManuscriptEditor
  },
  methods: {
    SaveChange() {
      this.$root.UpdateRecord(
        "Writer",
        this.$route.params.id,
        this.$root.shadowDB.Writer[
         this.$route.params.id
        ]
      );
    },
  }
};
</script>


<style scoped>

.sticky {
  position: sticky;
  top: 56px;
  z-index: 2;

}



@media only screen and (min-width: 960px) {
.sticky {
  top: 64px;
}
}

</style>