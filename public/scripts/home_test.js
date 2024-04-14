function startTest(subject) {
    // Перенаправление на страницу теста с выбранным предметом
    window.location.href = 'test.html?subject=' + encodeURIComponent(subject);
  }