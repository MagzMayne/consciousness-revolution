<!-- Vue.js sample for GitHub language detection -->
<!-- BarbrickDesign - Complete Language Portfolio -->

<template>
  <div class="greeter">
    <div class="greeter__container">
      <h1 class="greeter__message">{{ message }}</h1>
      <button @click="updateMessage" class="btn-primary">
        Update Message
      </button>
    </div>
    
    <div class="languages-list">
      <div
        v-for="(lang, index) in languages"
        :key="index"
        class="language-card"
      >
        <h3>{{ lang.name }}</h3>
        <p>{{ lang.paradigm }}</p>
        <span :class="`typing-${lang.typing.toLowerCase()}`">
          {{ lang.typing }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Greeter',
  data() {
    return {
      message: 'Hello from Vue.js!',
      languages: [
        { name: 'Vue', paradigm: 'Component-based', typing: 'Dynamic' },
        { name: 'React', paradigm: 'Component-based', typing: 'Dynamic' },
        { name: 'Angular', paradigm: 'Component-based', typing: 'Static' }
      ]
    }
  },
  methods: {
    updateMessage() {
      this.message = `Updated at ${new Date().toLocaleTimeString()}`;
    }
  },
  computed: {
    uppercaseLanguages() {
      return this.languages.map(lang => lang.name.toUpperCase());
    }
  },
  mounted() {
    console.log('Greeter component mounted');
  }
}
</script>

<style scoped>
.greeter {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
}

.greeter__message {
  color: #42b983;
  margin-bottom: 20px;
}

.btn-primary {
  background: #42b983;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:hover {
  background: #35a372;
}
</style>
