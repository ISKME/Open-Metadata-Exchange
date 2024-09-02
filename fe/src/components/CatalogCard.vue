<template>
  <v-card
    class="py-4"
    color="surface-variant"
    image="https://cdn.vuetifyjs.com/docs/images/one/create/feature.png"
    rounded="lg"
    variant="outlined"
    >

    <v-card-item prepend-icon="mdi-bookmark-outline">
      <v-card-title>
	<a :href="card.body.url">
	  {{ card.subject }}
	</a>
      </v-card-title>

      <v-card-subtitle>
	<div class="d-flex justify-center ga-2">
	  <v-chip v-for="keyword in card.body.keywords" :key="keyword">
	    {{ keyword }}
	  </v-chip>
	</div>
      </v-card-subtitle>

      <v-card-text>
	{{ card.body.description }}
      </v-card-text>

    </v-card-item>

    <v-divider class="mx-4 mb-1"></v-divider>

    <v-card-item>
      <v-card-text>
	<v-list>
	  <v-list-item v-for="std in card.body.alignment_tags"
		       :key="std"
		       :title="std"
		       >
	  </v-list-item>
	</v-list>
      </v-card-text>
    </v-card-item>

    <v-divider class="mx-4 mb-1"></v-divider>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
	color="medium-emphasis"
	icon="mdi-import"
	size="x-large"
	@click="$emit('importCard')"
	>
      </v-btn>
    </v-card-actions>

  </v-card>
</template>

<script setup>
  defineProps(['card']);
  defineEmits(['importCard'])
</script>
