/**
 * Override Forum Home with a custom one located at /ext
 */
import * as HomeForum from 'lib/site/home-forum/component'
import HomeForumExt from 'ext/lib/site/home-forum/component'

HomeForum.default = HomeForumExt

import * as HomeMultiForum from 'lib/site/home-multiforum/component'
import HomeMultiForumExt from 'ext/lib/site/home-multiforum/component'

HomeMultiForum.default = HomeMultiForumExt

import * as Header from 'lib/header/component'
import HeaderExt from 'ext/lib/site/header/component'

Header.default = HeaderExt

import * as TopicLayout from 'lib/site/topic-layout/component'
import TopicLayoutExt from 'ext/lib/site/topic-layout/component'

TopicLayout.default = TopicLayoutExt
