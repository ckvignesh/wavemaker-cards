<template>
<div>
<v-alert v-if="!$root.shadowDB.ManuscriptCards[this.uuid]" class="" >
    <v-icon>warning</v-icon>  This card is not in the database
</v-alert>
<div
 v-if="$root.shadowDB.ManuscriptCards[this.uuid]" class="wm_manuscripteditor" >
    <v-btn fab small absolute right  @click="showSrc=!showSrc"><v-icon>settings</v-icon></v-btn>
   <v-text-field
          label="Title"
          v-model="$root.shadowDB.ManuscriptCards[uuid].title"
          @keyup="SaveChange()"
        ></v-text-field>
             <tiptap-vuetify
             class="wm_manuscript"
                 v-if="!showSrc"
      v-model="$root.shadowDB.ManuscriptCards[uuid].content"
      :extensions="extensions"
      :toolbar-attributes="toolbarAttrs"
         @blur="SaveChange()"
    />
        
    <v-textarea
    v-if="showSrc"
     auto-grow
     filled
     v-model="$root.shadowDB.ManuscriptCards[uuid].content"
     @change="SaveChange()"
    ></v-textarea>

         
</div >
</div>
</template>
<script>
import {
  // component
  TiptapVuetify,
  // extensions
  Heading,
  Bold,
  Italic,
  Strike,
  Underline,
  Code,
  CodeBlock,
  Paragraph,
  BulletList,
  OrderedList,
  ListItem,
  Link,
  Blockquote,
  HardBreak,
  HorizontalRule,
  History,
  Image
} from "tiptap-vuetify";
 

export default {
  computed: {
    toolbarAttrs() {
      return this.$vuetify.theme.isDark
        ? { color: "dark", dark: true }
        : { color: "light", dark: false };
    }
  },
    components: { TiptapVuetify },
     data: () => ({
       showSrc : false,
    // declare extensions you want to use
    oldextensions: [
        History,
        Blockquote,
        Link,
        Underline,
        Strike,
        Italic,
        ListItem, // if you need to use a list (BulletList, OrderedList)
        BulletList,
        OrderedList,
        Image,
        [
          Heading,
          {
            // Options that fall into the tiptap's extension
            options: {
              levels: [1, 2, 3]
            }
          }
        ],
        Bold,
        Link,
        Code,
        CodeBlock,
        HorizontalRule,
        Paragraph,
        HardBreak // line break on Shift + Ctrl + Enter
      ],

      // Custom order of extensions to change the order of the buttons
      extensions: [
        Bold,
        Italic,
        Paragraph,
        [
          Heading,
          {
            options: {
              levels: [1, 2]
            }
          }
        ],
        Image
      ],
    // starting editor's content
    content: `
      <h1>Yay Headlines!</h1>
      <p>All these <strong>cool tags</strong> are working now.</p>
    `
  }),
    props:{
        uuid : String
    },
    methods:{
      SaveChange() {
        console.log("Apply manuscript forced changes ",  this.$root.shadowDB.ManuscriptCards[this.uuid].content)
 let html =this.$root.shadowDB.ManuscriptCards[this.uuid].content
   html = html.replaceAll("---", "&mdash;");
   html = html.replaceAll("--", "&ndash;");
this.$root.shadowDB.ManuscriptCards[this.uuid].content = html
      this.$root.UpdateRecord(
        "ManuscriptCards",
        this.uuid,
        this.$root.shadowDB.ManuscriptCards[this.uuid]
      );
    },
    },
    created(){
        if(!this.$root.shadowDB.ManuscriptCards[this.uuid]){
         // the card is not int database, meaning it's new! so
         console.log("Adding Record")
            let obj = {}
            obj.uuid=this.uuid
            obj.title =""
            obj.content=""
            this.$root.AddRecord("ManuscriptCards", obj);
        }
    }
}
</script>

<style scoped >
img{
  max-width:100%;
}
</style>