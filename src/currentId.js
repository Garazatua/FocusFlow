let currentProjectId = null;

const currentId = {
  get() {
    return currentProjectId;
  },
  set(id) {
    currentProjectId = id;
  }
};

export default currentId;