% Copyright (c) 2024 USTC
% Author: Ruixu Geng*, Jianyang Wang*, Yuqin Yuan, Fengquan Zhan, Tianyu Zhang, 
%         Rui Zhang, Pengcheng Huang, Dongheng Zhang, Jinbo Chen, Yang Hu, Yan Chen
% Title: A Comprehensive Survey on Wireless Sensing Security: A Role-based Perspective
% Publication: arxiv, 2024

% Read CSV file
data = readtable('AwesomeWSS.csv', 'VariableNamingRule', 'preserve');

% Data preprocessing
data.Year = double(data.Year);
data.Category = double(data.Category);
data.("Relevance Score") = double(data.("Relevance Score"));

% Filter by relevance score (threshold can be adjusted)
score_threshold = 1;
data = data(data.("Relevance Score") >= score_threshold, :);

% Get unique categories, venues, scores and years
categories = unique(data.Category);
venues = unique(data.("Journal/Conference"));
scores = unique(data.("Relevance Score"));
years = unique(data.Year);

% Keep data from 2021 onwards
years = years(years >= 2005);

% 1. Trend Analysis: Paper count trends by category per year (bar + line)
figure('Units', 'centimeters', 'Position', [1, 1, 12, 8]);
yearly_category_counts = zeros(length(years), length(categories));
for i = 1:length(years)
    for j = 1:length(categories)
        yearly_category_counts(i,j) = sum(data.Year == years(i) & data.Category == categories(j));
    end
end

% Draw bar chart
bar_handle = bar(years, yearly_category_counts, 'grouped');
colormap_categories = [218/255,227/255,245/255; 250/255,219/255,223/255; 227/255,242/255,217/255];
for i = 1:length(categories)
    set(bar_handle(i), 'FaceColor', colormap_categories(i,:));
end

hold on;
% Add line plots with markers
for i = 1:length(categories)
    plot(years, yearly_category_counts(:,i), '-o', 'LineWidth', 2, ...
        'Color', colormap_categories(i,:), 'MarkerFaceColor', 'white');
end
hold off;

grid on;
xlabel('Year');
ylabel('Number of Papers');
legend({'Victim', 'Weapon', 'Shield'}, 'Location', 'northwest');

% 2. Heatmap: Venue-Category Distribution
figure('Units', 'centimeters', 'Position', [14, 1, 12, 8]);
venue_category_counts = zeros(length(venues), length(categories));
for i = 1:length(venues)
    for j = 1:length(categories)
        venue_category_counts(i,j) = sum(strcmp(data.("Journal/Conference"), venues{i}) & ...
            data.Category == categories(j));
    end
end

% Calculate and sort total papers per venue
venue_total_papers = sum(venue_category_counts, 2);
[~, sort_idx] = sort(venue_total_papers, 'descend');

% Reorder heatmap data and venue labels
venue_category_counts = venue_category_counts(sort_idx, :);
venues = venues(sort_idx);

% Create custom blue colormap
blue_series = [
    218/255 227/255 245/255;  % Light blue
    169/255 190/255 230/255;  % Medium light blue
    120/255 153/255 215/255;  % Medium blue
    71/255  116/255 200/255;  % Deep blue
    22/255  79/255  185/255   % Darker blue
];
colormap_size = 64;
custom_colormap = interp1(linspace(0,1,size(blue_series,1)), blue_series, linspace(0,1,colormap_size));

% Draw heatmap
imagesc(venue_category_counts);
colormap(custom_colormap);
c = colorbar;
c.Label.String = 'Number of Papers';
xlabel('Category');
ylabel('Venue');
set(gca, 'YTick', 1:length(venues), 'YTickLabel', venues);
set(gca, 'XTick', 1:length(categories), 'XTickLabel', categories);

% 3. Relevance Score Distribution Heatmap
figure('Units', 'centimeters', 'Position', [27, 1, 12, 8]);
score_category_matrix = zeros(length(scores), length(categories));
for i = 1:length(scores)
    for j = 1:length(categories)
        score_category_matrix(i,j) = sum(data.("Relevance Score") == scores(i) & ...
            data.Category == categories(j));
    end
end

% Create custom pink colormap
pink_series = [
    250/255 219/255 223/255;  % Light pink
    243/255 186/255 193/255;  % Medium light pink
    236/255 153/255 163/255;  % Medium pink
    229/255 120/255 133/255;  % Deep pink
    222/255 87/255  103/255   % Darker pink
];
custom_colormap = interp1(linspace(0,1,size(pink_series,1)), pink_series, linspace(0,1,colormap_size));

% Draw heatmap
imagesc(score_category_matrix);
colormap(custom_colormap);
c = colorbar;
c.Label.String = 'Number of Papers';
xlabel('Category');
ylabel('Relevance Score');
set(gca, 'YTick', 1:length(scores), 'YTickLabel', scores);
set(gca, 'XTick', 1:length(categories), 'XTickLabel', categories);

% 4. Word Cloud Analysis
figure('Units', 'centimeters', 'Position', [40, 1, 12, 8]);
all_titles = data.Title;
titles_str = lower(strjoin(all_titles, ' '));
words = strsplit(titles_str);

% Define stopwords to remove
stopwords = {'a', 'an', 'the', 'in', 'on', 'at', 'for', 'to', 'of', 'and', ...
    'or', 'with', 'by', 'via', 'using', 'against', 'can', 'from', 'based', ...
    'through', 'into', 'over', 'under', 'between', 'after', 'before'};
words = words(~ismember(words, stopwords));

% Word lemmatization mapping
word_mapping = containers.Map;
word_mapping('attacks') = 'attack';
word_mapping('systems') = 'system';
word_mapping('networks') = 'network';
word_mapping('applications') = 'application';
word_mapping('methods') = 'method';
word_mapping('techniques') = 'technique';
word_mapping('algorithms') = 'algorithm';
word_mapping('analyses') = 'analysis';
word_mapping('securities') = 'security';
word_mapping('vulnerabilities') = 'vulnerability';
word_mapping('detections') = 'detection';
word_mapping('protections') = 'protection';

% Apply word normalization
normalized_words = cell(size(words));
for i = 1:length(words)
    if isKey(word_mapping, words{i})
        normalized_words{i} = word_mapping(words{i});
    else
        normalized_words{i} = words{i};
    end
end

% Generate word cloud
[unique_words, ~, idx] = unique(normalized_words);
word_counts = histcounts(idx, 1:length(unique_words)+1);
wordcloud(unique_words, word_counts, 'MaxDisplayWords', 100);

% Output statistical summary
fprintf('\n=== Statistical Summary (Score >= %d) ===\n', score_threshold);
fprintf('Total Papers: %d\n', size(data,1));
fprintf('Time Span: %d-%d\n', min(years), max(years));
fprintf('Number of Venues: %d\n', length(venues));
fprintf('Average Relevance Score: %.2f\n', mean(data.("Relevance Score")));

% Statistics by category
for i = 1:length(categories)
    cat_papers = data(data.Category == categories(i), :);
    fprintf('\nCategory %d:\n', categories(i));
    fprintf('  Papers: %d (%.1f%%)\n', height(cat_papers), ...
        100*height(cat_papers)/height(data));
    fprintf('  Avg Score: %.2f\n', mean(cat_papers.("Relevance Score")));
end