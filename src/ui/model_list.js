module.exports = function (context) {
  return function (selection) {
    const container = selection
      .append('div')
      .attr('class', 'model-list bg-white border-t border-gray-200');

    const header = container
      .append('div')
      .attr('class', 'px-3 py-2 font-bold text-sm bg-gray-100 cursor-pointer flex justify-between items-center')
      .on('click', () => {
        const list = container.select('.model-items');
        const icon = header.select('.toggle-icon');
        const hidden = list.classed('hidden');
        list.classed('hidden', !hidden);
        icon.attr('class', `toggle-icon fa-solid fa-caret-${hidden ? 'down' : 'right'}`);
      });

    header.append('span').text('3D Models');
    header.append('i').attr('class', 'toggle-icon fa-solid fa-caret-down');

    const list = container.append('div').attr('class', 'model-items text-sm');

    function renderModels() {
      const models = context.data.getModels();

      const items = list.selectAll('.model-item').data(models, (d) => d.id);

      items.exit().remove();

      const enter = items
        .enter()
        .append('div')
        .attr('class', 'model-item border-b border-gray-100 px-3 py-2');

      const titleRow = enter.append('div').attr('class', 'flex items-center justify-between mb-1');

      titleRow
        .append('span')
        .attr('class', 'model-name font-medium truncate')
        .style('max-width', '140px')
        .text((d) => d.name || d.id);

      const actions = titleRow.append('div').attr('class', 'flex items-center gap-2');

      actions
        .append('button')
        .attr('class', 'model-visibility text-xs px-1 py-0.5 rounded hover:bg-gray-200')
        .attr('title', 'Toggle visibility')
        .html((d) => d.visible ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>')
        .on('click', function (d) {
          d3.event.stopPropagation();
          const newVisible = !d.visible;
          d.instance.setVisible(newVisible);
          context.data.updateModel(d.id, (m) => {
            m.visible = newVisible;
          });
        });

      actions
        .append('button')
        .attr('class', 'model-delete text-xs px-1 py-0.5 rounded hover:bg-red-100 text-red-600')
        .attr('title', 'Delete model')
        .html('<i class="fa-solid fa-trash"></i>')
        .on('click', function (d) {
          d3.event.stopPropagation();
          if (window.scene && d.instance) {
            window.scene.remove(d.instance);
            d.instance.dispose();
          }
          context.data.removeModel(d.id);
        });

      const editToggle = enter
        .append('div')
        .attr('class', 'text-xs text-blue-600 cursor-pointer hover:underline mt-1')
        .text('Edit parameters')
        .on('click', function (d) {
          d3.event.stopPropagation();
          const editor = d3.select(this.parentNode).select('.model-editor');
          const hidden = editor.classed('hidden');
          editor.classed('hidden', !hidden);
          d3.select(this).text(hidden ? 'Hide parameters' : 'Edit parameters');
          if (hidden) {
            refreshEditorValues(d.instance, editor);
          }
        });

      const editor = enter.append('div').attr('class', 'model-editor hidden mt-2 space-y-2');

      ['position', 'scale', 'rotation'].forEach((type) => {
        const row = editor.append('div').attr('class', `model-${type}`);
        row.append('div').attr('class', 'text-xs font-semibold text-gray-500 mb-1 capitalize').text(type);
        const inputs = row.append('div').attr('class', 'flex gap-1');
        ['x', 'y', 'z'].forEach((axis) => {
          const labelWrap = inputs.append('div').attr('class', 'flex-1');
          labelWrap.append('div').attr('class', 'text-[10px] text-gray-400 text-center').text(axis);
          labelWrap
            .append('input')
            .attr('type', 'number')
            .attr('class', `model-input-${type}-${axis} w-full text-xs border border-gray-300 rounded px-1 py-0.5`)
            .attr('step', type === 'rotation' ? '0.01' : 'any')
            .on('change', function (d) {
              const val = parseFloat(this.value);
              if (Number.isNaN(val)) return;
              const params = d.instance.getParams();
              if (type === 'position') {
                d.instance.setPosition(
                  axis === 'x' ? val : params.position.x,
                  axis === 'y' ? val : params.position.y,
                  axis === 'z' ? val : params.position.z
                );
              } else if (type === 'scale') {
                d.instance.setScale(
                  axis === 'x' ? val : params.scale.x,
                  axis === 'y' ? val : params.scale.y,
                  axis === 'z' ? val : params.scale.z
                );
              } else if (type === 'rotation') {
                d.instance.setRotation(
                  axis === 'x' ? val : params.rotation.x,
                  axis === 'y' ? val : params.rotation.y,
                  axis === 'z' ? val : params.rotation.z
                );
              }
              context.data.updateModel(d.id, () => {});
            });
        });
      });

      items
        .select('.model-visibility')
        .html((d) => d.visible ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>');
    }

    function refreshEditorValues(instance, editorSelection) {
      const params = instance.getParams();
      if (!params) return;
      ['position', 'scale', 'rotation'].forEach((type) => {
        ['x', 'y', 'z'].forEach((axis) => {
          editorSelection.select(`.model-input-${type}-${axis}`).property('value', params[type][axis]);
        });
      });
    }

    renderModels();

    context.dispatch.on('change.model_list', (evt) => {
      // Only re-render when models change, and avoid clearing focused inputs
      const isModelChange = evt && evt.obj && evt.obj.models !== undefined;
      if (!isModelChange) return;
      const active = document.activeElement;
      if (active && active.tagName === 'INPUT' && d3.select(active).attr('class') && d3.select(active).attr('class').indexOf('model-input-') !== -1) return;
      renderModels();
    });
  };
};
