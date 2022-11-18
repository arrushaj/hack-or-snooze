"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  const hostName = story.getHostName();
  let className = "";

  if (currentUser) {
    className = "bi bi-star";
    for (let favorite of currentUser.favorites) {
      if (favorite.storyId === story.storyId) {
        className = "bi bi-star-fill";
      }
    }
  }
  return $(`
      <li id="${story.storyId}">
        <i class="${className}"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  // generate markup + prepend.
  $allStoriesList.show();
}

$("#submit-form").on("submit", addStoryToList);

/** Takes form inputs, calls storyList method
 * and refreshes page asynchronously using getAndShowStoriesOnStart
 */

async function addStoryToList() {
  const author = $("#author-input").val();
  const title = $("#title-input").val();
  const url = $("#url-input").val();

  let storyObj = { author, title, url };

  let newStory = await storyList.addStory(currentUser, storyObj);

  $allStoriesList.prepend(generateStoryMarkup(newStory));
  $navSubmitStory.trigger("reset");
  $navSubmitStory.hide();
}

$allStoriesList.on("click", "i", addOrRemoveFavorite);

async function addOrRemoveFavorite(evt) {
  let $containerListItem = $(evt.target).closest("li");
  let storyId = $containerListItem.attr("id");
  let storyObj = await Story.getStoryObj(storyId);

  if ($(evt.target).hasClass("bi-star-fill")) {
    await currentUser.removeFavorite(storyObj);
    $(evt.target).removeClass("bi-star-fill");
    $(evt.target).addClass("bi-star");
  } else {
    await currentUser.addFavorite(storyObj);
    $(evt.target).removeClass("bi-star");
    $(evt.target).addClass("bi-star-fill");
  }
}
